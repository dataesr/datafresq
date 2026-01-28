import { AutoGrid } from '@/components/Grids/AutoGrid';
import { WorkspaceCardSkeleton } from './WorkspaceCard';

const SKELETON_ITEMS = ['a', 'b', 'c', 'd', 'e', 'f'] as const;

export function WorkspaceSkeleton() {
  return (
    <AutoGrid type="fill" min={320}>
      {SKELETON_ITEMS.map((id) => (
        <WorkspaceCardSkeleton key={id} />
      ))}
    </AutoGrid>
  );
}
