import type { Ref } from "vue";
import { ref, watch } from "vue";

export type Position = {
    x: number;
    y: number;
};

/**
 * Простой composable для реализации логики перетаскивания (Drag & Drop)
 *
 * @returns {Ref<Position>} returns.position - Текущие координаты {x, y} в процентах.
 * @returns {Ref<boolean>} returns.isDragging - Статус перетаскивания.
 * @returns {Function} returns.onMouseDown - Метод для ручного инициирования события (если не передан eventTarget).
 *
 * @example
 * // Пример использования в компоненте:
 * const target = ref<HTMLElement>();
 * const { position, isDragging } = useDraggable({
 *   target,
 *   centered: true,
 *   ignore: '.close-button'
 * });
 */
export function useDraggable(params: {
    /**
     * Ref на DOM-элемент, который будет перемещаться.
     */
    target: Ref<HTMLElement | undefined | null>;
    /**
     * Ref на DOM-элемент, который будет отслеживать событие нажатия мыши `onMouseDown`. По умолчанию `target`.
     */
    eventTarget?: Ref<HTMLElement | undefined | null>;
    /**
     * Начальная позиция элемента в процентах `{ x: number, y: number }`.
     */
    initialPos?: Position;
    /**
     * Учитывать ли центрирование элемента
     */
    centered?: boolean;
    /**
     * Использовать ли смещение элемента (например в слайдере)
     */
    useOffset?: boolean;
    /**
     * Игнорируемый дочерний элемент - ref или css селектор
     */
    ignore?: Ref<HTMLElement | undefined | null> | string;
}) {
    const {
        target,
        eventTarget = target,
        initialPos,
        centered = false,
        useOffset = false,
        ignore,
    } = params;

    const position: Ref<Position> = ref(initialPos ?? { x: 0, y: 0 });
    const isDragging: Ref<boolean> = ref(false);

    let parentRect: DOMRect | null = null;
    let elementRect: DOMRect | null = null;
    let relativeClickOffset = { x: 0, y: 0 }; // Смещение клика внутри элемента

    watch(
        eventTarget,
        () => {
            const eventListenerTarget = eventTarget.value;
            if (!eventListenerTarget) return;

            eventListenerTarget.addEventListener("mousedown", (e) =>
                onMouseDown(e, target.value!),
            );
            eventListenerTarget.addEventListener(
                "touchstart",
                (e) => onMouseDown(e, target.value!),
                { passive: false },
            );
        },
        { immediate: true },
    );

    const onMouseMove = (_event: MouseEvent | TouchEvent) => {
        if (!isDragging.value || !parentRect || !elementRect) return;

        const event = "touches" in _event ? _event.touches[0] : _event;
        if (!event) return;

        // Рассчитываем смещение относительно границы родителя
        const offsetX = relativeClickOffset.x;
        const offsetY = relativeClickOffset.y;

        let newX = event.clientX - parentRect.left - offsetX;
        let newY = event.clientY - parentRect.top - offsetY;

        const offsetWidth = parentRect.width - elementRect.width;

        // Максимальные координаты с учётом центра
        const maxX =
            parentRect.width -
            (centered ? elementRect.width / 2 : elementRect.width);
        const maxY =
            parentRect.height -
            (centered ? elementRect.height / 2 : elementRect.height);

        // Минимальные координаты с учётом центра
        const minX = centered ? elementRect.width / 2 : 0;
        const minY = centered ? elementRect.height / 2 : 0;

        // Ограничиваем координаты в пределах границ родителя
        newX = Math.max(minX, Math.min(maxX, newX));
        newY = Math.max(minY, Math.min(maxY, newY));

        // Конвертируем в проценты
        const percentX = useOffset
            ? offsetWidth > 0
                ? (newX / offsetWidth) * 100
                : 0
            : (newX / parentRect.width) * 100;
        const percentY = (newY / parentRect.height) * 100;

        position.value = { x: percentX, y: percentY };

        document.querySelectorAll("[usedraggable-observable]").forEach((e) => {
            e.dispatchEvent(new CustomEvent("usedraggable-update"));
        });
    };

    const onMouseUp = () => {
        isDragging.value = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        document.removeEventListener("touchend", onMouseUp);
        document.removeEventListener("touchmove", onMouseMove);
    };

    const onMouseDown = (
        _event: MouseEvent | TouchEvent,
        element: HTMLElement | null,
    ) => {
        if (!element || !element.parentElement) return;

        if (ignore) {
            const target = _event.target as HTMLElement;
            if (typeof ignore == "string") {
                if (target.closest(ignore)) return;
            } else if (ignore.value && ignore.value.contains(target)) {
                return;
            }
        }

        if ("touches" in _event) {
            _event.preventDefault();
        }

        const event = "touches" in _event ? _event.touches[0] : _event;
        if (!event) return;
        // Сохраняем размеры родительского блока и элемента
        elementRect = element.getBoundingClientRect();
        parentRect = element.parentElement.getBoundingClientRect();

        // Если используется центрирование, учитываем его в смещении
        relativeClickOffset = {
            x:
                event.clientX -
                elementRect.left -
                (centered ? elementRect.width / 2 : 0),
            y:
                event.clientY -
                elementRect.top -
                (centered ? elementRect.height / 2 : 0),
        };

        isDragging.value = true;
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
        document.addEventListener("touchend", onMouseUp);
        document.addEventListener("touchmove", onMouseMove);
    };

    return {
        position,
        isDragging,
        onMouseDown,
    };
}
