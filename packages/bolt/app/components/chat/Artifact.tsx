import { useStore } from '@nanostores/react';
import { AnimatePresence, motion } from 'framer-motion';
import { computed } from 'nanostores';
import { useState } from 'react';
import { createHighlighter, type BundledLanguage, type BundledTheme, type HighlighterGeneric } from 'shiki';
import { getArtifactKey, workbenchStore, type ActionState } from '../../lib/stores/workbench';
import { classNames } from '../../utils/classNames';
import { cubicEasingFn } from '../../utils/easings';
import { IconButton } from '../ui/IconButton';

const highlighterOptions = {
  langs: ['shell'],
  themes: ['light-plus', 'dark-plus'],
};

const shellHighlighter: HighlighterGeneric<BundledLanguage, BundledTheme> =
  import.meta.hot?.data.shellHighlighter ?? (await createHighlighter(highlighterOptions));

if (import.meta.hot) {
  import.meta.hot.data.shellHighlighter = shellHighlighter;
}

interface ArtifactProps {
  artifactId: string;
  messageId: string;
}

export function Artifact({ artifactId, messageId }: ArtifactProps) {
  const [showActions, setShowActions] = useState(false);

  const artifacts = useStore(workbenchStore.artifacts);
  const artifact = artifacts[getArtifactKey(artifactId, messageId)];

  const actions = useStore(
    computed(artifact.actions, (actions) => {
      return Object.values(actions);
    }),
  );

  return (
    <div className="flex flex-col overflow-hidden border rounded-lg w-full">
      <div className="flex">
        <button
          className="flex items-stretch bg-gray-50/25 w-full overflow-hidden"
          onClick={() => {
            const showWorkbench = workbenchStore.showWorkbench.get();
            workbenchStore.showWorkbench.set(!showWorkbench);
          }}
        >
          <div className="flex items-center px-6 bg-gray-100/50">
            {!artifact?.closed ? (
              <div className="i-svg-spinners:90-ring-with-bg scale-130"></div>
            ) : (
              <div className="i-ph:code-bold scale-130 text-gray-600"></div>
            )}
          </div>
          <div className="px-4 p-3 w-full text-left">
            <div className="w-full">{artifact?.title}</div>
            <small className="inline-block w-full w-full">Click to open Workbench</small>
          </div>
        </button>
        <AnimatePresence>
          {actions.length && (
            <motion.button
              initial={{ width: 0 }}
              animate={{ width: 'auto' }}
              exit={{ width: 0 }}
              transition={{ duration: 0.15, ease: cubicEasingFn }}
              className="hover:bg-gray-200"
              onClick={() => setShowActions(!showActions)}
            >
              <div className="p-4">
                <div className={showActions ? 'i-ph:caret-up-bold' : 'i-ph:caret-down-bold'}></div>
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        {showActions && actions.length > 0 && (
          <motion.div
            className="actions"
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: '0px' }}
            transition={{ duration: 0.15 }}
          >
            <div className="p-4 text-left border-t">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                <h4 className="font-semibold mb-2">Actions</h4>
                <ul className="list-none space-y-2.5">
                  {actions.map((action, index) => {
                    const { status, type, content, abort } = action;

                    return (
                      <li key={index} className={classNames(getTextColor(action.status))}>
                        <div className="flex items-center gap-1.5">
                          <div className="text-lg">
                            {status === 'running' ? (
                              <div className="i-svg-spinners:90-ring-with-bg"></div>
                            ) : status === 'pending' ? (
                              <div className="i-ph:circle-duotone"></div>
                            ) : status === 'complete' ? (
                              <div className="i-ph:check-circle-duotone"></div>
                            ) : status === 'failed' || status === 'aborted' ? (
                              <div className="i-ph:x-circle-duotone"></div>
                            ) : null}
                          </div>
                          {type === 'file' ? (
                            <div>
                              Create <code className="bg-gray-100 text-gray-700">{action.filePath}</code>
                            </div>
                          ) : type === 'shell' ? (
                            <div className="flex items-center w-full min-h-[28px]">
                              <span className="flex-1">Run command</span>
                              {abort !== undefined && status === 'running' && (
                                <IconButton icon="i-ph:x-circle" size="xl" onClick={() => abort()} />
                              )}
                            </div>
                          ) : null}
                        </div>
                        {type === 'shell' && <ShellCodeBlock classsName="mt-1" code={content} />}
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getTextColor(status: ActionState['status']) {
  switch (status) {
    case 'pending': {
      return 'text-gray-500';
    }
    case 'running': {
      return 'text-gray-1000';
    }
    case 'complete': {
      return 'text-positive-600';
    }
    case 'aborted': {
      return 'text-gray-600';
    }
    case 'failed': {
      return 'text-negative-600';
    }
    default: {
      return undefined;
    }
  }
}

interface ShellCodeBlockProps {
  classsName?: string;
  code: string;
}

function ShellCodeBlock({ classsName, code }: ShellCodeBlockProps) {
  return (
    <div
      className={classNames('text-xs', classsName)}
      dangerouslySetInnerHTML={{ __html: shellHighlighter.codeToHtml(code, { lang: 'shell', theme: 'dark-plus' }) }}
    ></div>
  );
}