const items = document.querySelectorAll('#galleryWrap .item');
const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

if (items.length && supportsHover) {
  items.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      items.forEach((i) => {
        i.style.flex = '1';
      });
      item.style.flex = '7';
    });

    item.addEventListener('mouseleave', () => {
      items.forEach((i) => {
        i.style.flex = '1';
      });
    });
  });
}
