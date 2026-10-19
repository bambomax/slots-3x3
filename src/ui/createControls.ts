export function createControls(
  host: HTMLElement,
  onSpin: () => void,
) {
  const spinButton = document.createElement('button');

  spinButton.type = 'button';
  spinButton.textContent = 'Spin';

  spinButton.addEventListener('click', onSpin);

  host.appendChild(spinButton);

  const destroy = (): void => {
    spinButton.removeEventListener('click', onSpin);
    spinButton.remove();
  };

  return { spinButton, destroy };
}