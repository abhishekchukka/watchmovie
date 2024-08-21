import { useEffect, useState } from "react";

export function useLocalstorage(initialState, key) {
  const [watched, setWatched] = useState(function () {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : initialState;
  });
  useEffect(
    function () {
      localStorage.setItem(key, JSON.stringify(watched));
    },
    [key, watched]
  );
  return [watched, setWatched];
}
