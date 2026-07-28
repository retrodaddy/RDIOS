/**
 * Attention Engine — Operating System Layer. Shapes here follow the
 * frozen RDIOS Experience Principles v1 §2 exactly: three tiers, nothing
 * else. Act Now items are verb-first per the Architecture Freeze
 * Declaration's closing lens — a `verb` is mandatory, not optional,
 * because an item with no available verb isn't Act Now, it's Be Aware.
 */
export type AttentionItem = {
  id: string;
  title: string;
  meta: string;
  verb: string;
  href: string;
};

export type BeAwareItem = {
  id: string;
  label: string;
  value: string;
  sub: string;
};

export type HistoryEntry = {
  id: string;
  summary: string;
  occurredAt: string;
};
