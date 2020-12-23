The responsibility of a Model
=============================

The separation of the _model_ and the _view_ allows us to look at the core of the
problem and focus on implementing the model correctly and efficiently.

The model actually consists of two things

  1. the state, or more precisely, the set of possible states, parameterized
     with a serializable structural data (i.e. a JSON-like object)
  2. the state transition function (STF). It is actually a set of functions, which are
     commonly called "actions", each representing a particular way in which the
     state can "mutate". Note that this notion of "mutation" could be
     implemented with true mutations, but in a highly concurrent system, it is
     much better to be implemented with a immutable scheme (e.g. having a
     immutable database like DataScript). This "set of functions" can themselves
     be parameterized using something called "action parameters" (or sometimes
     people call them "action types" and "payloads").

Do not ignore the fact that the STF is very much integrated as part of the model
and thus has close coupling with the state parameterization.

If something like DataScript is used, the model becomes very much like an
Entity-Component-System (ECS) pattern. The state will be parameterized as
entities connected to values via attributes, just like "components" in ECS

```
  [ 0  :x      60        ]
  [ 0  :y      32        ]
  [ 0  :z      475       ]
  [ 0  :color  "#ff0000" ]
  [ 0  :vel-x  7.114     ]
  [ 0  :vel-y  4.634     ]
  [ 0  :vel-z  3.143     ]
  [ 0  :acl-x  0.9214    ]
  [ 0  :acl-y  0.6146    ]
  [ 0  :acl-z  0.6271    ]

  [ 1  :x      137       ]
  [ 1  :y      855       ]
  [ 1  :z      774       ]
  [ 1  :color  "#0000ff" ]
  [ 1  :vel-x  8.275     ]
  [ 1  :vel-y  2.168     ]
  [ 1  :vel-z  6.673     ]
  [ 1  :acl-x  0.4902    ]
  [ 1  :acl-y  0.4419    ]
  [ 1  :acl-z  0.0403    ]

  ...
```

In this kind of system, the STF will have different branches (i.e., action
types) that correspond to different "systems" in ECS. For example, if we have
the rendering system and the physics simulation system, they will look like this
in the STF:

```
(defn physics-simulation-tick-handler
  []
  (stf {:type :physics-simulation-tick}))

;; Recognize that in Redux this stf is called "dispatch"
(defn stf
  [{:keys [type] :as action}]
  (case type
    :physics-simulation-tick (d/transact conn (simulation-progress @conn))))
    
(defn simulation-progress
  [db]
  ;; do displacement, velocity, and acceleration calculations
  [
   [:db/add 0 :x 123]
   [:db/add 0 :y 9278]
   [:db/add 0 :z 4133]
   [:db/add 0 :vel-x 7.73]
   ]
  )
```

However, a lot of times, this database transaction is too slow to process. So,
if we could have the assumption that all calls to the STF are sequential (which
they are in the case of JavaScript without Web Workers), then it should be safe
to replace those serialized transactions with direct mutations.
