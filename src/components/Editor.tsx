'use client';
import React, { FC, useCallback, useEffect, useRef } from 'react';
import TextareaAutoSize from 'react-textarea-autosize';
import { useForm } from 'react-hook-form';
import {
  PostCreationRequest,
  PostValidator,
} from '@/lib/validator/formValidator';
import { zodResolver } from '@hookform/resolvers/zod';
import type EditorJS from '@editorjs/editorjs';
import { uploadFiles } from '@/lib/uploadThings';
import { useIsMounted } from 'usehooks-ts';
type EditorProps = {
  subredditId: string;
};

interface EditorForm extends PostCreationRequest {}

export const Editor: FC<EditorProps> = ({ subredditId }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditorForm>({
    resolver: zodResolver(PostValidator),
    defaultValues: { subredditId, title: '', content: null },
  });

  const editorRef = useRef<EditorJS>();
  const componentMounted = useIsMounted();

  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import('@editorjs/editorjs')).default;
    const Header = (await import('@editorjs/header')).default;
    const Embed = (await import('@editorjs/embed')).default;
    const Table = (await import('@editorjs/table')).default;
    const List = (await import('@editorjs/embed')).default;
    const Code = (await import('@editorjs/code')).default;
    const LinkTool = (await import('@editorjs/link')).default;
    const InlineCode = (await import('@editorjs/inline-code')).default;
    const ImageTool = (await import('@editorjs/image')).default;

    if (!editorRef.current) {
      const editor = new EditorJS({
        holder: 'editor',
        onReady: () => {
          editorRef.current = editor;
        },
        placeholder: 'Type here to write your post...',
        inlineToolbar: true,
        data: { blocks: [] },
        tools: {
          header: Header,
          linkTool: {
            class: LinkTool,
            config: { endpoint: '/api/link' },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  const [res] = await uploadFiles([file], 'imageUploader');
                  return { success: 1, file: { url: res.fileUrl } };
                },
              },
            },
          },
          list: List,
          code: Code,
          embed: Embed,
          inlineCode: InlineCode,
          table: Table,
        },
      });
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      if (initializeEditor) {
        await initializeEditor();

        setTimeout(() => {
          //set focus
        });
      }
    };

    if (componentMounted()) {
      init();
      return () => {};
    }
  }, [componentMounted(), initializeEditor]);
  return (
    <div className="w-full p-4 bg-zinc-50 rounded-lg border border-zinc-200">
      <form
        id={EDITOR_FORM_ID}
        className="w-fit"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div className="prose prose-stone dark:prose-invert">
          <TextareaAutoSize
            placeholder="Title"
            className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold focus:outline-none"
          />
          <div id="editor" className="min-h-[500px]" />
        </div>
      </form>
    </div>
  );
};

export const EDITOR_FORM_ID = 'subreddit-form-id';
