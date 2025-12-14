import React from "react";
import { Folder, FileCode, ChevronRight, ChevronDown } from "lucide-react";
import clsx from "clsx";

export type FileNode = {
  name: string;
  type: "file" | "folder";
  children?: FileNode[];
  content?: string; // <--- Added this to store mock code!
};

interface FileTreeProps {
  files: FileNode[];
  onFileSelect?: (file: FileNode) => void; // <--- Added this callback
}

const FileTreeNode = ({ 
  node, 
  depth = 0, 
  onFileSelect 
}: { 
  node: FileNode; 
  depth?: number;
  onFileSelect?: (file: FileNode) => void;
}) => {
  const [isOpen, setIsOpen] = React.useState(true);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent bubbling
    if (node.type === "folder") {
      setIsOpen(!isOpen);
    } else {
      onFileSelect?.(node); // <--- Trigger the callback
    }
  };

  return (
    <div className="select-none text-sm">
      <div 
        className={clsx(
          "flex items-center gap-2 py-1 px-2 cursor-pointer transition-colors",
          depth > 0 && "ml-4",
          "hover:bg-titanium-800/50 text-titanium-400 hover:text-titanium-100"
        )}
        onClick={handleClick}
      >
        <span className="opacity-70">
          {node.type === "folder" ? (
             isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />
          ) : (
             <span className="w-3.5" /> 
          )}
        </span>
        
        <span className="text-blue-400">
          {node.type === "folder" ? <Folder size={16} /> : <FileCode size={16} />}
        </span>
        
        <span className={clsx("font-mono", node.type === "folder" && "font-bold text-titanium-200")}>
          {node.name}
        </span>
      </div>

      {node.type === "folder" && isOpen && node.children && (
        <div className="border-l border-titanium-800 ml-3.5 pl-1">
          {node.children.map((child, index) => (
            <FileTreeNode 
              key={`${child.name}-${index}`} 
              node={child} 
              depth={depth + 1} 
              onFileSelect={onFileSelect} // Pass it down recursively
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function FileTree({ files, onFileSelect }: FileTreeProps) {
  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="space-y-1">
        {files.map((node, index) => (
          <FileTreeNode key={`${node.name}-${index}`} node={node} onFileSelect={onFileSelect} />
        ))}
      </div>
    </div>
  );
}