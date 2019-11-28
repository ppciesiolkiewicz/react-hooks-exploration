import React, { Component, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { get, noop } from 'lodash';

import './App.css';

const getRandomColor = () => "#"+((1<<24)*Math.random()|0).toString(16);


let renderCount = {};
let effectCount = {};

const getRenderCount = name => get(renderCount, name, 0);
const setRenderCount = name => {
  renderCount[name] = getRenderCount(name) + 1;
};


const getEffectCount = name => get(effectCount, name, 0);
const setEffectCount = name => {
  effectCount[name] = getEffectCount(name) + 1;
}

const Count = ({ name, count }) => {
  const COUNT_PROGRESS_BAR_MULT = 5;
  const style = {
    width: `${count * COUNT_PROGRESS_BAR_MULT}px`,
  };

  return (
    <div className="count">
      <span className="countText">
        <span>{name}:</span>
        <span>{count}</span>
      </span>
      <div className="countProgress" style={style} />
    </div>
  );
};

const RenderCount = ({ name }) => {
  setRenderCount(name);

  return (
    <Count name={name} count={getRenderCount(name)}/>
  );
};

const EffectCount = ({ name }) => (
  <Count name={name} count={getEffectCount(name)}/>
);


const effectNames = [
  'no_second_argument',
  'second_argument_empty_array',
  'fn_without_use_callback',
  'fn_with_use_callback',
  'primitiveValue',
  'primitiveValueUseMemo',
  'complexValue',
  'complexValueUseMemo',
  'timeout',
];

const Hooks = ({ containerName, fn, fnUseCallback, primitiveValue, primitiveValueUseMemo, complexValue, complexValueUseMemo }) => {
  const [clickCount, setClickCount] = useState(0);
  const [timeoutState, setTimeoutState] = useState(0);
  const timeout = useRef(null);

  useEffect(() => {
    setEffectCount(effectNames[0]);
  });

  useEffect(() => {
    setEffectCount(effectNames[1]);
  }, []);

  useEffect(() => {
    fn();
    setEffectCount(effectNames[2]);
  }, [fn]);

  useEffect(() => {
    fnUseCallback();
    setEffectCount(effectNames[3]);
  }, [fnUseCallback]);

  useEffect(() => {
    noop(primitiveValue);
    setEffectCount(effectNames[4]);
  }, [primitiveValue]);

  useEffect(() => {
    noop(primitiveValueUseMemo);
    setEffectCount(effectNames[5]);
  }, [primitiveValueUseMemo]);

  useEffect(() => {
    noop(complexValue);
    setEffectCount(effectNames[6]);
  }, [complexValue]);

  useEffect(() => {
    noop(complexValueUseMemo);
    setEffectCount(effectNames[7]);
  }, [complexValueUseMemo]);

  const handleSetTimeout = () => {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
        console.log('timeout fired');
        setTimeoutState(timeoutState + 1);
      }, 3000);
  };
  useEffect(() => {
    setEffectCount(effectNames[8]);
    return () => clearTimeout(timeout.current);
  }, []);

  // report effects
  useEffect(() => {
    const text = `${containerName}\n${JSON.stringify(effectCount).replace(/[,{}]/g, '\n')}\n----`;
    console.log(text);
  });

  return (
    <section style={{ border: `5px solid ${getRandomColor()}`}}>
      <RenderCount name="Hooks" />
      {effectNames.map(name => <EffectCount key={name} name={name} />)}

      <button onClick={() => setClickCount(clickCount + 1)}>
        Just a button. Clicked {clickCount} times
      </button>
      <button onClick={handleSetTimeout}>
        Start timeout, state={timeoutState}
      </button>
    </section>
  );
};

const FunctionalContainer = () => {
  const [clickCount, setClickCount] = useState(0);
  const [inputValue, setInputValue] = useState('random');

  const [a, setA] = useState(0);
  const [b, setB] = useState(1);

  const handleSetValue = setValue => () => {
    const v = inputValue === 'random'
      ? Math.ceil(Math.random() * 3)
      : parseInt(inputValue, 10);

    if (v) {
      setValue(v);
    }
  };

  const fn = () => a + b;
  const fnUseCallback = useCallback(() => a + b, [a, b]);
  const primitiveValue = a + b;
  const primitiveValueUseMemo = useMemo(() => a + b, [a, b])
  const complexValue = { a, b };
  const complexValueUseMemo = useMemo(() => ({ a, b }), [a, b])

  return (
    <section>
      <h1>FunctionalContainer</h1>
      <div>
        <label>
          <input value={inputValue} onChange={({ target: { value } }) => setInputValue(value)} />
          Value for a or b. Type random to use random value from 1-3
        </label>
      </div>
      <button onClick={handleSetValue(setA)}>
        Set a, a = {a}
      </button>
      <button onClick={handleSetValue(setB)}>
        Set b, b = {b}
      </button>
      <button onClick={() => setClickCount(clickCount + 1)}>
        Parent container button. Clicked {clickCount} times
      </button>
      <Hooks
        containerName="FunctionalContainer"
        fn={fn}
        fnUseCallback={fnUseCallback}
        primitiveValue={primitiveValue}
        primitiveValueUseMemo={primitiveValueUseMemo}
        complexValue={complexValue}
        complexValueUseMemo={complexValueUseMemo}
      />
    </section>
  );
};

class ClassContainer extends Component {
  constructor() {
    super();
    this.state = {
      clickCount: 0,
      inputValue: 'random',
      a: 0,
      b: 1,
    };

    this.handleSetValueA = this.handleSetValueA.bind(this);
    this.handleSetValueB = this.handleSetValueB.bind(this);
    this.setClickCount = this.setClickCount.bind(this);
    this.handleInputValueChange = this.handleInputValueChange.bind(this);
    this.fnUseCallback = this.fnUseCallback.bind(this);
  }

  handleSetValue(setValue) {
    const { inputValue } = this.state;

    const v = inputValue === 'random'
      ? Math.ceil(Math.random() * 3)
      : parseInt(inputValue, 10);

    if (v) {
      setValue(v);
    }
  }

  handleSetValueA() {
    const { b } = this.state;
    this.handleSetValue(a =>
      this.setState({
        a,
        primitiveValueUseMemo: a + b,
        complexValueUseMemo: { a, b }
      })
    );
  }

  handleSetValueB() {
    const { a } = this.state;
    this.handleSetValue(b =>
      this.setState({
        b,
        primitiveValueUseMemo: a + b,
        complexValueUseMemo: { a, b }
      })
    );
  }

  setClickCount() {
    this.setState(({ clickCount }) => ({
      clickCount: clickCount + 1,
    }));
  }

  fnUseCallback() {
    const { a, b } = this.state;

    return a + b;
  }

  handleInputValueChange({ target: { value } }) {
     this.setState({
       inputValue: value,
     });
  };

  render() {
    const { inputValue, clickCount, a, b, primitiveValueUseMemo, complexValueUseMemo } = this.state;
    const fn = () => a + b;
    const primitiveValue = a + b;
    const complexValue = { a, b };

    return (
      <section>
        <h1>ClassContainer</h1>
        <div>
          <label>
            <input value={inputValue} onChange={this.handleInputValueChange} />
            Value for a or b. Type random to use random value from 1-3
          </label>
        </div>
        <button onClick={this.handleSetValueA}>
          Set a, a = {a}
        </button>
        <button onClick={this.handleSetValueB}>
          Set b, b = {b}
        </button>
        <button onClick={() => this.setClickCount(clickCount + 1)}>
          Parent container button. Clicked {clickCount} times
        </button>
        <Hooks
          containerName="ClassContainer"
          fn={fn}
          fnUseCallback={this.fnUseCallback}
          primitiveValue={primitiveValue}
          primitiveValueUseMemo={primitiveValueUseMemo}
          complexValue={complexValue}
          complexValueUseMemo={complexValueUseMemo}
        />
      </section>
    );
  }
};

const App = () => {
  const [mode, setMode] = useState(0);

  const handleModeChange = () => {
    setMode((mode + 1) % 2);
    renderCount = {};
    effectCount = {};
  };

  return (
    <div>
      <button onClick={handleModeChange}>change mode, mode={mode}</button>
      {mode === 0 && <FunctionalContainer />}
      {mode === 1 && <ClassContainer />}
    </div>
  );
};

export default App;
