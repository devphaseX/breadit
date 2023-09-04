'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import { FC } from 'react';
type OutputComponent = typeof import('editorjs-react-renderer')['default'];
const Output = dynamic(
  () =>
    import('editorjs-react-renderer').then(
      ({ default: exportDefault }) => exportDefault
    ),
  { ssr: false }
) as OutputComponent;

type EditorOutputProps = {
  content: unknown;
};

const style = {
  paragraph: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
};

interface CustomImageRendererProps {
  data: { file: { url: string } };
}

const CustomImageRenderer = ({ data }: CustomImageRendererProps) => {
  const src = data.file.url;

  return (
    <div className="relative w-full min-h-[15rem]">
      <Image alt="image" className="object-contain" fill src={src} />
    </div>
  );
};

const CustomCodeRenderer = ({ data }: { data: { code: string } }) => {
  return (
    <pre className="bg-gray-800 rounded-md p-4">
      <code className="text-gray-100 text-sm">{data.code}</code>
    </pre>
  );
};

const renderers = {
  image: CustomImageRenderer,
  code: CustomCodeRenderer,
};

const EditorOutput: FC<EditorOutputProps> = ({ content }) => {
  return (
    <Output
      data={content}
      className="text-sm"
      style={style}
      renderer={renderers}
    />
  );
};

export { EditorOutput };
