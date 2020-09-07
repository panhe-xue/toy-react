const RENDER_TO_DOM = Symbol("render to dom")


// 数组展平
function flatten(arr) {
  return arr.reduce((res, currentValue) => {
    if( Array.isArray(currentValue)) {
      return [...res, ...flatten(currentValue)]
    } else {
      return [...res, currentValue]
    }
  }, [])
}

export class Component {

  constructor(type) {
    this.props = Object.create(null)
    this.children = []
    this._root = null
    this._range = null
    this._vdom = null
  }
  setAttribute(name, value) {
    this.props[name] = value
  }
  appendChild(component) {
    this.children.push(component)
  }

  [RENDER_TO_DOM](range) {
    this._range = range
    this._vdom = this.vdom
    this._vdom[RENDER_TO_DOM](range)
  }
  update() {
    let isSameNode = (oldNode, newNode) => {
      if(oldNode.type !== newNode.type) return false
      
      for(let name in newNode.props) {
        if(newNode.props[name] !== oldNode.props[name]) {
          return false;
        }
      }

      if(Object.keys(newNode.props).length !== Object.keys(oldNode).length) {
        return false
      }

      if(newNode.type === "#text") {
        if(newNode.content !== oldNode.content) return false
      }

      return true
    }

    let update = (oldNode, newNode) => {
      if(!isSameNode(oldNode, newNode)) {
        newNode[RENDER_TO_DOM](oldNode._range)
        return
      }
      newNode._range = oldNode._range

      let newChildren = newNode.vchildren
      let oldChildren = oldNode.vchildren

      if(!newChildren || !newChildren.length) return

      let tailRange = oldChildren[oldChildren.length - 1]._range
      for (let i = 0; i < newChildren.length; i++) {
        let newChild = newChildren[i];
        let oldChild = oldChildren[i];
        if(i < oldChild.length) {
          update(oldChild, newChild)
        } else {
          // todo
          let range = document.createRange()
          range.setStart(tailRange.endContainer, tailRange.endOffset)
          range.setEnd(tailRange.endContainer, tailRange.endOffset)
          newChild[RENDER_TO_DOM](range)
          tailRange = range
        }
      }
    }

    let vdom = this.vdom
    update(this._vdom, vdom)
    this._vdom = vdom
  }
  get vdom() {

    return this.render().vdom
  }
  setState(newState) {
    
    if(this.state === null || typeof this.state !== 'object') {
      this.state = newState
      // this.rerender()
      this.update()
      return
    }
    let merge = (oldState, newState) => {
      for(let p in newState) {
        if(oldState[p] === null || typeof oldState[p] !== 'object' ){
          oldState[p] = newState[p]
        } else {
          merge(oldState[p], newState[p])
        }
      }
    }
    merge(this.state, newState)

    this.update()
  }
}

class ElementWrapper extends Component {
  constructor(type) {
    super(type)
    this.type = type
  }
  [RENDER_TO_DOM](range) {
    this._range = range

    let root = document.createElement(this.type);

    for(let name in this.props) {
      let value = this.props[name]
      if(name.match(/^on([\s\S]+)/)) {
        root.addEventListener(RegExp.$1.replace(/^[\s\S]/, i => i.toLowerCase()), value)
      } else {
        if(name === 'className') {
          root.setAttribute('class', value)
        } else {
          root.setAttribute(name, value)
        }
      }
    }

    for(let child of this.children) {
      let childRange = document.createRange()
      childRange.setStart(root, root.childNodes.length)
      childRange.setEnd(root, root.childNodes.length)
      childRange.deleteContents()
      child[RENDER_TO_DOM](childRange)
    }
    replaceContent(range, root)
  }
  get vdom() {
    this.vchildren = this.children.map(child => child.vdom)
    return this
  }
}

class TextNodeWrapper extends Component {
  constructor(content) {
    super(content)
    this.type = '#text'
    this.content = content
  }
  [RENDER_TO_DOM](range) {
    this._range = range

    let root = document.createTextNode(this.content)
    replaceContent(range, root)
  }
  get vdom() {
    return this
  }
}

function replaceContent(range, node) {
  range.insertNode(node)
  range.setStartAfter(node)
  range.deleteContents()

  range.setStartBefore(node)
  range.setEndAfter(node)
}

export function CreateElement(tagName, attribute, ...children) {
  let vElement;
  if(typeof tagName === "string") {
    vElement = new ElementWrapper(tagName)
  } else {
    vElement = new tagName()
  }

  for(let attr in attribute ) {
    vElement.setAttribute(attr, attribute[attr])
  }
  // 数组展平
  children = flatten(children)

  for(let child of children) {
    if(typeof child === 'string') {
      child = new TextNodeWrapper(child)
    }
    vElement.appendChild(child)
  }
  return vElement
}

export function render(component, parents) {
  let range = document.createRange()
  range.setStart(parents, 0)
  range.setStart(parents, parents.childNodes.length)
  range.deleteContents()
  component[RENDER_TO_DOM](range)
}