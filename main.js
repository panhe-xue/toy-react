import { CreateElement, render, Component } from './toy-react'


class MyComponent extends Component {
  render() {
    return (
      <div>
        <h1>My Component</h1>
        {this.children}
      </div>
    )
  }
}

render(<MyComponent class="name">
    <div>aaa</div>
    <div>vvv</div>
    <div>bbb</div>
  </MyComponent>,
  document.body
)
