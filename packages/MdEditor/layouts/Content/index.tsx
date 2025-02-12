import { defineComponent, ref, inject } from 'vue';
import { prefix } from '~/config';
import { useAutoScroll, useCodeMirror, useResize } from './composition';
import { contentProps as props, ContentProps } from './props';
import ContentPreview from './ContentPreview';
import MdCatalog from '~~/MdCatalog';
import { FocusOption } from '~/type';

export default defineComponent({
  name: 'MDEditorContent',
  props,
  setup(props: ContentProps, ctx) {
    const editorId = inject('editorId') as string;
    const html = ref<string>('');

    const contentRef = ref<HTMLDivElement>();
    const resizeRef = ref<HTMLDivElement>();

    // 输入框
    const { inputWrapperRef, codeMirrorUt, resetHistory } = useCodeMirror(props);
    const { inputWrapperStyle, resizeOperateStyle, showPreviewWrapper, showNuxtContentSlot } = useResize(
      props,
      contentRef,
      resizeRef
    );
    // 自动滚动
    useAutoScroll(props, html, codeMirrorUt);

    ctx.expose({
      getSelectedText() {
        return codeMirrorUt.value?.getSelectedText();
      },
      focus(options: FocusOption) {
        codeMirrorUt.value?.focus(options);
      },
      resetHistory,
      getEditorView() {
        return codeMirrorUt.value?.view;
      }
    });

    return () => {
      return (
        <div
          class={`${prefix}-content${showPreviewWrapper.value ? ' has-preview' : ''}`}
          ref={contentRef}
        >
          <div
            class={`${prefix}-input-wrapper`}
            style={inputWrapperStyle}
            ref={inputWrapperRef}
          />
          {/* 拖拽入口需要保持props.setting变化时就挂载 */}
          {(props.setting.htmlPreview || props.setting.preview) && (
            <div
              class={`${prefix}-resize-operate`}
              style={resizeOperateStyle}
              ref={resizeRef}
            />
          )}
          {showPreviewWrapper.value && (
            <ContentPreview
              modelValue={props.modelValue}
              onChange={props.onChange}
              setting={props.setting}
              onHtmlChanged={(html_) => {
                html.value = html_;
                props.onHtmlChanged(html_);
              }}
              onGetCatalog={props.onGetCatalog}
              mdHeadingId={props.mdHeadingId}
              noMermaid={props.noMermaid}
              sanitize={props.sanitize}
              noKatex={props.noKatex}
              formatCopiedText={props.formatCopiedText}
              noHighlight={props.noHighlight}
              noImgZoomIn={props.noImgZoomIn}
              sanitizeMermaid={props.sanitizeMermaid}
              codeFoldable={props.codeFoldable}
              autoFoldThreshold={props.autoFoldThreshold}
            />
          )}
          {
            showNuxtContentSlot.value && ctx.slots.nuxtContent&&ctx.slots.nuxtContent()
          }
          {props.catalogVisible && (
            <MdCatalog
              theme={props.theme}
              class={`${prefix}-catalog-editor`}
              editorId={editorId}
              mdHeadingId={props.mdHeadingId}
              key="internal-catalog"
              scrollElementOffsetTop={2}
            />
          )}
        </div>
      );
    };
  }
});
