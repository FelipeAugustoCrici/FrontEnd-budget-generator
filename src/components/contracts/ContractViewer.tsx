interface Props {
  content: string
}

export function ContractViewer({ content }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div
        className="prose prose-sm max-w-none px-12 py-10 text-sm text-gray-800"
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
