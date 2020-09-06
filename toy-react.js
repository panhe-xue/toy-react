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

class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value)
  }
  appendChild(component) {
    let range = document.createRange()
    range.setStart(this.root, this.root.childNodes.length)
    range.setEnd(this.root, this.root.childNodes.length)
    range.deleteContents()
    component[RENDER_TO_DOM](range)
  }
  [RENDER_TO_DOM](range) {
    range.deleteContents()
    range.insertNode(this.root)
  }
}

class TextNodeWrapper {
  constructor(type) {
    this.root = document.createTextNode(type)
  }
  [RENDER_TO_DOM](range) {
    range.deleteContents()
    range.insertNode(this.root)
  }
}


export class Component {

  constructor(type) {
    this.props = Object.create(null)
    this.children = []
    this._root = null
    this._range = null
  }
  setAttribute(name, value) {
    this.props[name] = value
  }
  appendChild(component) {
    this.children.push(component)
  }

  [RENDER_TO_DOM](range) {
    this._range = range
    this.render()[RENDER_TO_DOM](range)
  }
  rerender() {
    this._range.deleteContents()
    this[RENDER_TO_DOM](this._range)
  }
}

export function CreateElement(tagName, attribute, ...children) {
  let tag;
  if(typeof tagName === "string") {
    tag = new ElementWrapper(tagName)
  } else {
    tag = new tagName()
  }

  for(let attr in attribute ) {
    tag.setAttribute(attr, attribute[attr])
  }
  // 数组展平
  children = flatten(children)

  for(let child of children) {
    if(typeof child === 'string') {
      child = new TextNodeWrapper(child)
    }
    tag.appendChild(child)
  }
  return tag
}

export function render(component, parents) {
  let range = document.createRange()
  range.setStart(parents, 0)
  range.setStart(parents, parents.childNodes.length)
  range.deleteContents()
  component[RENDER_TO_DOM](range)
}