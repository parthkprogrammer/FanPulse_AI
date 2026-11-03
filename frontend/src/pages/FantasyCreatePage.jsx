import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Shield, ArrowLeft, CheckCircle2, AlertTriangle, Save, Info, RefreshCw } from 'lucide-react';
import { Card, Badge, Button, Input, Alert, SkeletonCard } from '../components/ui';
import {
  MatchSelector,
  DraftProgressHeader,
  RoleFilterTabs,
  PlayerPoolList,
  CaptainViceCaptainModal,
  TeamCompositionSummary,
} from '../components/fantasy';
import { fantasyService } from '../services/fantasyService';
import { matchService } from '../services/matchService';

export const FantasyCreatePage = () => {
  const { matchId: paramMatchId } = useParams();
  const [searchParams] = useSearchParams();
  const queryMatchId = searchParams.get('matchId');
  const navigate = useNavigate();

  // Match Fixture State
  const [matches, setMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState(paramMatchId || queryMatchId || 'm-ind-aus-t20');

  // Player Pool & Selection State
  const [playerPool, setPlayerPool] = useState([]);
  const [selectedPlayers, setSelectedPlayers] = useState([]);
  const [activeRoleFilter, setActiveRoleFilter] = useState('ALL');

  // Captain & Vice-Captain State
  const [captainPlayerId, setCaptainPlayerId] = useState('');
  const [viceCaptainPlayerId, setViceCaptainPlayerId] = useState('');

  // Team Form State
  const [teamName, setTeamName] = useState('');
  const [teamNameTouched, setTeamNameTouched] = useState(false);

  // Status & Notification State
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [successMessage, setSuccessMessage] = useState(null);
  const [activeStep, setActiveStep] = useState('DRAFT'); // 'DRAFT' or 'CAPTAINS'

  // Load Matches list
  useEffect(() => {
    let isMounted = true;
    const fetchMatches = async () => {
      try {
        const response = await matchService.getMatches({ status: 'ALL' });
        if (isMounted) {
          setMatches(response.matches || []);
        }
      } catch (err) {
        // Keep fallback matches
      }
    };
    fetchMatches();
    return () => {
      isMounted = false;
    };
  }, []);

  // Load Player Roster for selected match
  const loadRoster = useCallback(async (matchId) => {
    setIsLoading(true);
    setError(null);
    try {
      const rosterData = await fantasyService.getMatchRoster(matchId);
      setPlayerPool(rosterData.players || []);
      // Reset squad when switching matches
      setSelectedPlayers([]);
      setCaptainPlayerId('');
      setViceCaptainPlayerId('');
      setValidationErrors([]);
    } catch (err) {
      setError(err.message || 'Failed to load match player roster.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedMatchId) {
      loadRoster(selectedMatchId);
    }
  }, [selectedMatchId, loadRoster]);

  // Distinct team codes in current roster
  const teamCodes = useMemo(() => {
    const set = new Set(playerPool.map((p) => p.teamCode));
    return Array.from(set);
  }, [playerPool]);

  // Filtered Player Pool
  const filteredPlayers = useMemo(() => {
    if (activeRoleFilter === 'ALL') return playerPool;
    return playerPool.filter((p) => p.role === activeRoleFilter);
  }, [playerPool, activeRoleFilter]);

  // Handle Player Selection & Deselection (Preventing Duplicates)
  const handleTogglePlayer = (player) => {
    setError(null);
    setValidationErrors([]);
    const isAlreadySelected = selectedPlayers.some((p) => p.id === player.id);

    if (isAlreadySelected) {
      // Remove player
      setSelectedPlayers((prev) => prev.filter((p) => p.id !== player.id));
      if (captainPlayerId === player.id) setCaptainPlayerId('');
      if (viceCaptainPlayerId === player.id) setViceCaptainPlayerId('');
    } else {
      // Add player if under limit of 11
      if (selectedPlayers.length >= 11) {
        setError('Squad limit reached: A fantasy team must contain exactly 11 players.');
        return;
      }
      setSelectedPlayers((prev) => [...prev, player]);
    }
  };

  // Reset entire squad
  const handleResetSquad = () => {
    setSelectedPlayers([]);
    setCaptainPlayerId('');
    setViceCaptainPlayerId('');
    setValidationErrors([]);
    setError(null);
  };

  // Real-time Composition Validation
  const compositionValidation = useMemo(() => {
    return fantasyService.validateTeamComposition({
      teamName,
      players: selectedPlayers,
      captainPlayerId,
      viceCaptainPlayerId,
    });
  }, [teamName, selectedPlayers, captainPlayerId, viceCaptainPlayerId]);

  // Handle Team Submission
  const handleSaveTeam = async (e) => {
    if (e) e.preventDefault();
    setTeamNameTouched(true);
    setError(null);
    setValidationErrors([]);
    setSuccessMessage(null);

    // Validate team composition
    if (!compositionValidation.isValid) {
      setValidationErrors(compositionValidation.errors);
      return;
    }

    setIsSubmitting(true);
    try {
      const saved = await fantasyService.saveFantasyTeam({
        matchId: selectedMatchId,
        teamName,
        captainPlayerId,
        viceCaptainPlayerId,
        players: selectedPlayers,
      });

      setSuccessMessage(`Team "${saved.teamName}" drafted and registered successfully!`);
      // Optional redirect after short delay or keep user feedback
      setTimeout(() => {
        navigate('/fantasy/teams');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to save fantasy team to the database.');
      if (err.validationErrors) {
        setValidationErrors(err.validationErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentMatch = matches.find((m) => m.id === selectedMatchId) || {
    id: selectedMatchId,
    title: 'India vs Australia — 3rd T20I',
    format: 'T20',
  };

  return (
    <div className="space-y-6">
      {/* Navigation Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/matches">
            <Button variant="ghost" size="sm" leftIcon={ArrowLeft} className="-ml-2 text-xs">
              Back to Matches
            </Button>
          </Link>
          <div className="flex items-center gap-2 mt-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
              <Shield className="w-6 h-6 text-cricket-gold" />
              <span>Fantasy Team Builder</span>
            </h1>
            <Badge variant="warning" size="xs">
              DEMO DATA
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-1">
            Draft an 11-player squad adhering to official composition constraints. Server-side rules govern authoritative scoring.
          </p>
        </div>

        {/* Action Header */}
        <div className="flex items-center gap-2">
          <Link to="/fantasy/teams">
            <Button variant="secondary" size="sm">
              My Teams
            </Button>
          </Link>
        </div>
      </div>

      {/* Match Selector Accordion/Card */}
      {matches.length > 0 && (
        <MatchSelector
          matches={matches}
          selectedMatchId={selectedMatchId}
          onSelectMatch={(mId) => setSelectedMatchId(mId)}
        />
      )}

      {/* Draft Progress Sticky Header */}
      <DraftProgressHeader
        selectedPlayers={selectedPlayers}
        teamCodes={teamCodes}
        onResetSquad={handleResetSquad}
      />

      {/* Step Switcher (Draft Roster vs Captain Selection) */}
      <div className="flex items-center gap-2 border-b border-pitch-border pb-2">
        <button
          type="button"
          onClick={() => setActiveStep('DRAFT')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeStep === 'DRAFT'
              ? 'bg-cricket-gold text-pitch-background shadow-md shadow-cricket-gold/10'
              : 'bg-pitch-surface text-gray-400 hover:text-white border border-pitch-border'
          }`}
        >
          1. Select Players ({selectedPlayers.length}/11)
        </button>

        <button
          type="button"
          onClick={() => setActiveStep('CAPTAINS')}
          disabled={selectedPlayers.length === 0}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
            activeStep === 'CAPTAINS'
              ? 'bg-cricket-gold text-pitch-background shadow-md shadow-cricket-gold/10'
              : 'bg-pitch-surface text-gray-400 hover:text-white border border-pitch-border'
          }`}
        >
          2. Choose Captain & VC
        </button>
      </div>

      {/* Validation or API Error Alerts */}
      {error && (
        <Alert variant="danger" title="Validation or Submission Error" icon={AlertTriangle}>
          <p className="text-xs">{error}</p>
        </Alert>
      )}

      {validationErrors.length > 0 && (
        <Alert variant="warning" title="Team Composition Issues" icon={AlertTriangle}>
          <ul className="text-xs list-disc list-inside space-y-1">
            {validationErrors.map((err, idx) => (
              <li key={idx}>{err}</li>
            ))}
          </ul>
        </Alert>
      )}

      {successMessage && (
        <Alert variant="success" title="Success" icon={CheckCircle2}>
          <p className="text-xs">{successMessage}</p>
        </Alert>
      )}

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Player Pool or Captain Picker */}
        <div className="lg:col-span-2 space-y-4">
          {activeStep === 'DRAFT' && (
            <>
              {/* Role Filter Tabs */}
              <RoleFilterTabs
                activeRole={activeRoleFilter}
                onSelectRole={setActiveRoleFilter}
                playerPool={playerPool}
                selectedPlayers={selectedPlayers}
              />

              {/* Shimmer Loading */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {Array.from({ length: 6 }).map((_, idx) => (
                    <SkeletonCard key={idx} hasAvatar lines={2} />
                  ))}
                </div>
              ) : (
                <PlayerPoolList
                  players={filteredPlayers}
                  selectedPlayers={selectedPlayers}
                  onTogglePlayer={handleTogglePlayer}
                />
              )}

              {selectedPlayers.length === 11 && (
                <div className="p-4 rounded-xl bg-cricket-green/10 border border-cricket-green/30 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-cricket-green flex-shrink-0" />
                    <span className="text-xs text-white font-semibold">
                      11 players picked! Proceed to designate Captain and Vice-Captain.
                    </span>
                  </div>
                  <Button
                    variant="gold"
                    size="sm"
                    onClick={() => setActiveStep('CAPTAINS')}
                    className="text-xs whitespace-nowrap"
                  >
                    Next: Choose Captains
                  </Button>
                </div>
              )}
            </>
          )}

          {activeStep === 'CAPTAINS' && (
            <CaptainViceCaptainModal
              players={selectedPlayers}
              captainPlayerId={captainPlayerId}
              viceCaptainPlayerId={viceCaptainPlayerId}
              onSelectCaptain={setCaptainPlayerId}
              onSelectViceCaptain={setViceCaptainPlayerId}
            />
          )}
        </div>

        {/* Right 1 Col: Team Name & Final Submission Drawer */}
        <div className="space-y-4">
          <Card variant="default" padding="md" className="border-pitch-border space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-pitch-border">
              Team Registration
            </h3>

            {/* Team Name Input */}
            <div>
              <Input
                label="Fantasy Squad Name"
                placeholder="e.g. Royal Strikers XI"
                value={teamName}
                onChange={(e) => {
                  setTeamName(e.target.value);
                  setTeamNameTouched(true);
                }}
                error={
                  teamNameTouched && teamName.trim().length < 3
                    ? 'Team name must be at least 3 characters'
                    : undefined
                }
                helperText="Give your team a unique name (3-100 characters)"
              />
            </div>

            {/* Summary of drafted lineup */}
            <TeamCompositionSummary
              players={selectedPlayers}
              captainPlayerId={captainPlayerId}
              viceCaptainPlayerId={viceCaptainPlayerId}
              onRemovePlayer={handleTogglePlayer}
            />

            {/* Save Team CTA */}
            <Button
              variant="gold"
              size="md"
              onClick={handleSaveTeam}
              disabled={isSubmitting || !compositionValidation.isValid}
              isLoading={isSubmitting}
              leftIcon={Save}
              className="w-full justify-center"
            >
              {isSubmitting ? 'Registering Squad...' : 'Save & Register Squad'}
            </Button>

            {!compositionValidation.isValid && selectedPlayers.length > 0 && (
              <p className="text-[11px] text-amber-400/90 text-center font-medium">
                {compositionValidation.errors[0]}
              </p>
            )}

            {/* Server-Side Scoring Notice */}
            <div className="p-3 rounded-xl bg-pitch-surface/70 border border-pitch-border text-[11px] text-gray-400 space-y-1">
              <div className="flex items-center gap-1.5 text-gray-300 font-semibold">
                <Info className="w-3.5 h-3.5 text-cricket-gold" />
                <span>Authoritative Scoring Notice</span>
              </div>
              <p>
                Fantasy points are calculated server-side post-match according to verified scoring rules. Captain (2×) and Vice-Captain (1.5×) multipliers apply automatically.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default FantasyCreatePage;
