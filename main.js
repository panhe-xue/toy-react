import { CreateElement, render, Component } from './toy-react'


class MyComponent extends Component {
  constructor() {
    super()
    this.state= {
      a: 1,
      b: 2
    }
  }
  render() {
    return (
      <div>
        <h1>My Component</h1>
        <button onClick={() => {
          this.setState({
            a: ++this.state.a
          })
          // this.rerender()
        }}>增加</button>
        <p>{this.state.a.toString()}</p>
        {this.children}
      </div>
    )
  }
}

render(<MyComponent class="name">
    <div>aaa</div>
    <div>vvv</div>
    <div>bbb</div>
    <div>fff</div>
  </MyComponent>,
  document.body
)

// const com = <MyComponent class="name">
// <div>aaa</div>
// <div>vvv</div>
// <div>bbb</div>
// </MyComponent>

// console.log(com.vdom)
