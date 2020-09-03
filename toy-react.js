

class ElementWrapper {
  constructor(type) {
    this.root = document.createElement(type)
  }
  setAttribute(name, value) {
    this.root.setAttribute(name, value)
  }
  appendChild(child) {
    this.root.appendChild(child.root)
  }
}

class TextNodeWrapper {
  constructor(type) {
    this.root = document.createTextNode(type)
  }
}


export class Component {

  constructor(type) {
    this.props = Object.create(null)
    this.children = []
    this._root = null
  }
  setAttribute(name, value) {
    this.props[name] = value
  }
  appendChild(component) {
    this.children.push(component)
  }

  get root() {
    if(!this._root) this._root = this.render().root
    return this._root
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
  for(let child of children) {
    if(typeof child === 'string') {
      child = new TextNodeWrapper(child)
    }
    tag.appendChild(child)
  }
  return tag
}

export function render(component, parents) {
  parents.appendChild(component.root)
}