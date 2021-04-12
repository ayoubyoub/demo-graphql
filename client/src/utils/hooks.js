import { useState } from "react";

export const useForm = (callback, initialState = {}) => {
  const [values, setValues] = useState(initialState);

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues({
      ...values,
      [name]: value,
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    // onsubmit action can be different so having the callback as an argument to this hook makes this more reusable
    callback();
  };

  return {
    onChange,
    onSubmit,
    values,
  };
};
