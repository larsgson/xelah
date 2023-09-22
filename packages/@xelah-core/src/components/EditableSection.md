# EditableSection

This component is what the EditableContent component uses after it segments the content into sections. It uses EditableBlock by segmenting the sections into blocks first.

```js
import {useState} from 'react';

const _content = `Section to be edited with multiple lines.
Line 2
Line 3

Line 5`;

// const component = (props) => (<p {...props}></p>);
const [ content, setContent ] = useState(_content);

console.log('EditableSection.md:\n\n', content);

const [ show, setShow ] = useState(true);

const onShow = () => { setShow(!show); };

const components = {
  sectionHeading: (props) => (<h4 {...props}>{props.content.split('\n')[0]}</h4>),
};

const handlers = {
  onBlockClick: ({content: _content, index}) => {
    console.log(index, _content);
  },
};

function handleContent (str) {
  console.log(str)
  setContent(str)
}

const props = {
  content,
  onContent: (str) => handleContent(str),
  onInput: (ev) => console.log(ev),
  options: {},
  components,
  handlers,
  show,
  onShow
};

console.log(props);

<EditableSection {...props} />;
```
