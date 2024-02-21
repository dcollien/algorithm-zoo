export const getParent = () => {
  if (window.opener) {
    return window.opener;
  } else {
    return window.parent;
  }
}

export const sendMessage = (message) => {
  const parent = getParent();
  const payload = JSON.stringify(message);

  if (parent) {
    parent.postMessage(payload, '*');
  }

  if (parent === window) {
    console.log(payload);
  }
};
