
import React, { useState } from 'react';

const App = () => {
  const [count, setCount] = useState(0);
  return (
    <div className="p-10">
      <h1 className="text-4xl font-bold">Hello World</h1>
      <button onClick={() => setCount(count + 1)}>Count: {count}</button>
    </div>
  );
};

export default App;