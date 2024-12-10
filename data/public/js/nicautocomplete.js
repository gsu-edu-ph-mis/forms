class AutocompleteComponent extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' }); // Shadow DOM for encapsulating the component
      this.shadowRoot.innerHTML = `
        <style>
          .autocomplete {
            position: relative;
            display: inline-block;
            width: 100%;
          }
          .autocomplete-items {
            position: absolute;
            border: 1px solid #d4d4d4;
            border-bottom: none;
            border-top: none;
            z-index: 99;
            top: 100%;
            left: 0;
            right: 0;
            max-height: 200px;
            overflow-y: auto;
            background-color: white;
          }
          .autocomplete-item {
            padding: 10px;
            cursor: pointer;
            background-color: #fff;
            border-bottom: 1px solid #d4d4d4;
          }
          .autocomplete-item:hover {
            background-color: #e9e9e9;
          }
        </style>
        <div class="autocomplete">
          <input part="input" type="text" id="autocomplete-input" placeholder="Search...">
          <div id="autocomplete-list" class="autocomplete-items"></div>
        </div>
      `;
    }
  
    connectedCallback() {
      const input = this.shadowRoot.getElementById('autocomplete-input');
      const list = this.shadowRoot.getElementById('autocomplete-list');
  
      input.addEventListener('input', (e) => this.handleInput(e.target.value, list));
      document.addEventListener('click', (e) => this.closeAllLists(e.target));
    }
  
    handleInput(value, list) {
      list.innerHTML = '';
      if (!value) return false;
  
      const suggestions = this.getSuggestions(value);
      suggestions.forEach(suggestion => {
        const item = document.createElement('div');
        item.classList.add('autocomplete-item');
        item.innerHTML = suggestion;
        item.addEventListener('click', () => {
          this.shadowRoot.getElementById('autocomplete-input').value = suggestion;
          list.innerHTML = '';
        });
        list.appendChild(item);
      });
    }
  
    getSuggestions(value) {
      const availableSuggestions = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape', 'kiwi'];
      return availableSuggestions.filter(item => item.toLowerCase().startsWith(value.toLowerCase()));
    }
  
    closeAllLists(target) {
      if (!target.closest('.autocomplete')) {
        this.shadowRoot.getElementById('autocomplete-list').innerHTML = '';
      }
    }
  }
  
  customElements.define('autocomplete-component', AutocompleteComponent);
  