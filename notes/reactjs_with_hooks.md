What exactly are the hooks in ReactJS and how to use them
=========================================================

Without hooks, functional components in ReactJS are supposed to be pure
functions that map _props_ to _vdom_. A _vdom_ simply consists of nested calls
to `React.createElement`.

Previously, with **class components**, people attach code to the ReactJS
lifecycle by adding code to the corresponding class methods. The problem with
that is, to accomplish a moderately complex functionality, one would need to
put inter-related code at several locations across different class methods.
It is fine (and even desirable) when the code is meant for one project, as
the reader of the code can easily recognize what the code is going to be doing
at any specific lifecycle point.

```
class MyComponent extends React.Component {
  constructor() {
    // ...
  }
  
  componentDidMount() {
    // ...
  }
  
  shouldComponentUpdate() {
    // ...
  }
  
  componentDidUpdate() {
    // ...
  }
  
  getSnapshotBeforeUpdate() {
    // ...
  }
  
  componentWillUnmount() {
    // ...
  }
  
  componentDidCatch() {
    // ...
  }
  
  render() {
    return <>...</>
  }
}
```

Here is how these lifecycle hijack points are used during the rendering pipelines [1]:

  * Mounting
      - `constructor()`
      - `static getDerivedStateFromProps()`
      - `render()`
      - `componentDidMount()`
  * Updating
      - `static getDerivedStateFromProps()`
      - `shouldComponentUpdate()`
      - `render()`
      - `getSnapshotBeforeUpdate()`
      - `componentDidUpdate()`
  * Unmounting
      - `componentWillUnmount()`
  * Error Handling
      - `static getDerivedStateFromError()`
      - `componentDidCatch()`
      
[1] https://reactjs.org/docs/react-component.html#the-component-lifecycle

However, from the perspective of the implementation of a functionality itself,
the code is fragmented into multiple class methods. This makes it difficult to
package the implementation into a library for other components to use.

So, their solution is to not have the individual class methods as lifecycle
hijack points at all. Instead, have these things happening in the `render` method.
Since the `render` method will be called in all the pipelines -- be it "mounting",
"updating", or "unmounting".

So, instead of writing:

```
class MyComponent extends React.Component {
  constructor(props) {
    super(props);
    this.fooData = fooInitialize(this.props);
  }
  
  componentDidMount() {
    fooOnComponentDidMount(this.fooData);
  }
  
  componentDidUpdate() {
    fooOnComponentDidUpdate(this.fooData);
  }
  
  componentWillUnmount() {
    fooOnComponentWillUnmount(this.fooData);
  }
  
  render() {
    return <>...</>
  }
}
```

You could write:

```
const MyComponent = (props) => {

  const fooData = useRef(fooInitialize(props));
  useEffect(() => {
    fooOnComponentDidMount(this.fooData)
    return () => {
      fooOnComponentWillUnmount(this.fooData)
    };
  }, []);
  useEffect(fooOnComponentDidUpdate(this.fooData));

  return <>...</>;
}
```


This "lumping together" of logic belonging to the same functionality naturally
makes the code harder to read. It is not least because every call to a hook is
only executed at a specific time (or specific times), and you would need to
figure out "when" by looking at its last argument. And the order you write them
don't have to correspond to the temporal order they will be executed.

But interestingly, the power of this approach also comes from the fact that you
could add logic to any lifecycle point in any order. This means that you could
very easily package a bunch of code executed at different times that
accomplishes a single complex logic. The same thing used to require sprinkling
of code at many different locations across multiple lifecycle methods, which is
very difficult to package.

A function component that uses hooks is no longer a pure function. Even when
given the exact same `props`, it will generate different vdoms based on local
memory (`useState`, `useReducer`, `useRef`), when it is called or if something
particular has changed (`useEffect`, `useLayoutEffect`, `useMemo`,
`useCallback`), and something non-local that does not participate in react's
normal information flow (`useContext`, `useImperativeHandle`). The various
built-in hooks are the fundamental building blocks of any custom hooks. Each of
them provide a way for the a _stateful_ function to see a part of its "context".
