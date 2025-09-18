import './style.css';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="page">
    <h1 class="title">翻转卡片示例</h1>
    <div class="cards">
      <div class="flip-card">
        <div class="flip-card-inner">
          <div class="flip-card-front">A</div>
          <div class="flip-card-back">A+</div>
        </div>
      </div>
      <div class="flip-card">
        <div class="flip-card-inner">
          <div class="flip-card-front">B</div>
          <div class="flip-card-back">B+</div>
        </div>
      </div>
      <div class="flip-card">
        <div class="flip-card-inner">
          <div class="flip-card-front">C</div>
          <div class="flip-card-back">C+</div>
        </div>
      </div>
    </div>
  </div>
`;

// 使每张卡片可被鼠标拖动（Pointer 事件，支持触控/鼠标）
(() => {
  const draggableCards = Array.from(document.querySelectorAll<HTMLElement>('.flip-card'));

  draggableCards.forEach((card, index) => {
    // 初始位移，避免 transform 累积；保存在 dataset 中
    let startPointerX = 0;
    let startPointerY = 0;
    let startTranslateX = Number(card.dataset.tx || 0);
    let startTranslateY = Number(card.dataset.ty || 0);

    const onPointerDown = (ev: PointerEvent) => {
      card.setPointerCapture(ev.pointerId);
      card.classList.add('dragging');
      startPointerX = ev.clientX;
      startPointerY = ev.clientY;
      startTranslateX = Number(card.dataset.tx || 0);
      startTranslateY = Number(card.dataset.ty || 0);
    };

    const onPointerMove = (ev: PointerEvent) => {
      if (!card.classList.contains('dragging')) return;
      const dx = ev.clientX - startPointerX;
      const dy = ev.clientY - startPointerY;
      const nextX = startTranslateX + dx;
      const nextY = startTranslateY + dy;
      card.style.transform = `translate(${nextX}px, ${nextY}px)`;
      card.dataset.tx = String(nextX);
      card.dataset.ty = String(nextY);
    };

    const endDrag = (ev: PointerEvent) => {
      if (!card.classList.contains('dragging')) return;
      card.classList.remove('dragging');
      try { card.releasePointerCapture(ev.pointerId); } catch {}
    };

    card.addEventListener('pointerdown', onPointerDown);
    card.addEventListener('pointermove', onPointerMove);
    card.addEventListener('pointerup', endDrag);
    card.addEventListener('pointercancel', endDrag);
    card.addEventListener('pointerleave', endDrag);

    // 设置初始层级，避免被其他元素覆盖
    card.style.willChange = 'transform';
  });
})();
