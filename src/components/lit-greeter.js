import { LightDomElement } from '../light-dom-element.js'
import { html } from 'lit'
import { translate } from './localization.js'

export default class LitGreeter extends LightDomElement {
  static properties = {
    name: { type: String },
  }

  constructor() {
    super()
    this.name = ''
  }

  render() {
    return html`<h1>${translate('greet', this.name)}</h1>`
  }
}

customElements.define('lit-greeter', LitGreeter)
