import * as orbit from './lib/orbit';
import dataUrl from './day6.orbits';

const root = document.getElementById('data-container');

const renderNode = (node) => {
  const div = document.createElement('div')
  div.style.display = 'flex';
  div.style.alignItems = 'flex-start';
  div.style.justifyContent = 'flex-start';
  div.style.marginBottom = '4px';
  div.style.height = 'auto';
  const text = document.createTextNode(node.id);
  div.appendChild(text);

  const children = document.createElement('div');
  children.style.borderLeft = '1px black solid';

  node.children.forEach((child) => {
    children.appendChild(renderNode(child));
  });

  div.appendChild(children);

  return div;
}

fetch(dataUrl)
  .then(response => response.text())
  .then(orbit.loadFromString)
  .then((buffer) => {
    root.appendChild(renderNode(buffer.COM));
  });
