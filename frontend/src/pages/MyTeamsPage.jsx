import React from 'react';
import { Users, Plus, Shield } from 'lucide-react';
import { Button, EmptyState, Modal, Badge } from '../components/ui';
import { useModal } from '../hooks';

export const MyTeamsPage = () => {
  const createModal = useModal(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-cricket-green" />
            <span>Fantasy Teams</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Build and manage your 11-player squad with deterministic points calculation
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={Plus}
          onClick={createModal.openModal}
        >
          Create New Team
        </Button>
      </div>

      {/* Empty State Component */}
      <EmptyState
        icon={Shield}
        title="No Fantasy Teams Created Yet"
        description="Select an upcoming match to draft your dream XI, assign Captain (2x) and Vice-Captain (1.5x), and compete."
        action={
          <Button
            variant="secondary"
            size="sm"
            leftIcon={Plus}
            onClick={createModal.openModal}
          >
            Draft First Squad
          </Button>
        }
      />

      {/* Team Creation Preview Modal */}
      <Modal
        isOpen={createModal.isOpen}
        onClose={createModal.closeModal}
        title="Fantasy Squad Builder"
        description="Squad selection rules and real-time player budget validation."
      >
        <div className="space-y-4 py-2">
          <div className="p-4 rounded-xl bg-pitch-elevated border border-pitch-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-300">Composition Rules</span>
              <Badge variant="gold" size="xs">100 Credits Limit</Badge>
            </div>
            <ul className="text-xs text-gray-400 space-y-1 list-disc pl-4">
              <li>Exactly 11 players per drafted fantasy squad</li>
              <li>Maximum 7 players from a single cricket team</li>
              <li>1 Captain (2x points) & 1 Vice-Captain (1.5x points)</li>
            </ul>
          </div>

          <p className="text-xs text-gray-400">
            Full interactive roster builder and live credit tracking are scheduled for implementation in Milestone 8.
          </p>
        </div>

        <Modal.Footer>
          <Button variant="outline" size="sm" onClick={createModal.closeModal}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={createModal.closeModal}>
            Understood
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default MyTeamsPage;
