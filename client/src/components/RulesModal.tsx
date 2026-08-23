import React, { useState, useEffect } from 'react';
import { TournamentConfig } from '../types';
import {
  X,
  ShieldAlert,
  Award,
  Gift,
  Edit3,
  Plus,
  Trash2,
  Save,
  Check,
  RotateCcw,
} from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TournamentConfig;
  onSaveConfig?: (newConfig: TournamentConfig) => Promise<void>;
}

export const RulesModal: React.FC<RulesModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [prizePool, setPrizePool] = useState(config.prizePool || '');
  const [rules, setRules] = useState<{ title: string; description: string }[]>(config.rules || []);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state whenever modal opens or config updates
  useEffect(() => {
    if (config) {
      setPrizePool(config.prizePool || '');
      setRules(config.rules ? JSON.parse(JSON.stringify(config.rules)) : []);
      setIsEditing(false);
    }
  }, [config, isOpen]);

  if (!isOpen) return null;

  const handleAddRule = () => {
    setRules([
      ...rules,
      {
        title: `Regla #${rules.length + 1}`,
        description: 'Escribe aquí la descripción de la regla...',
      },
    ]);
  };

  const handleUpdateRule = (index: number, field: 'title' | 'description', value: string) => {
    const updated = [...rules];
    updated[index] = { ...updated[index], [field]: value };
    setRules(updated);
  };

  const handleDeleteRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
  };

  const handleResetDefaultRules = () => {
    setRules([
      {
        title: 'Solo Queue Obligatorio',
        description: 'Solo cuentan las partidas de Ranked Solo/Duo 5v5 jugadas durante el periodo del torneo.',
      },
      {
        title: 'Objetivo de Clasificación',
        description: 'El ranking se ordena por LP y División alcanzada en SoloQ. Quien alcance mayor elo al final del tiempo gana el desafío.',
      },
      {
        title: 'Desempates y Puntuación',
        description: 'En caso de empate en LP y División, el desempate se decide por el porcentaje de Winrate (%) y mayor cantidad de victorias.',
      },
      {
        title: 'Fair Play',
        description: 'Prohibido el duo boosteo o el wintrading. Todas las cuentas deben ser jugadas exclusivamente por su participante.',
      },
    ]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSaveConfig) return;

    setIsSaving(true);
    try {
      await onSaveConfig({
        ...config,
        prizePool: prizePool.trim(),
        rules: rules.filter((r) => r.title.trim().length > 0),
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving rules and prizes:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0e1422] border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 sm:py-5 border-b border-slate-800 bg-[#090d16] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Normas & Premios del Torneo</h3>
              <p className="text-xs text-slate-400">
                {isEditing ? 'Modifica la bolsa de premios y las reglas oficiales' : `Reglas oficiales del ${config.name}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onSaveConfig && !isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSave} className="p-6 sm:p-7 space-y-6 overflow-y-auto overflow-x-hidden flex-1">
          {/* Prize Pool Section */}
          <div className="bg-gradient-to-r from-amber-950/40 via-[#181a13] to-slate-900 border border-amber-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg shadow-amber-950/20">
            <div className="flex items-center gap-3.5 flex-1 w-full">
              <div className="p-3 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-neon-gold shrink-0">
                <Gift className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  Bolsa de Premios
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    required
                    placeholder="Ej: 10,000 RP + Corona de Campeón..."
                    value={prizePool}
                    onChange={(e) => setPrizePool(e.target.value)}
                    className="w-full bg-[#080b12] border border-amber-500/50 rounded-xl px-3.5 py-2 text-sm text-white font-bold placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
                  />
                ) : (
                  <h4 className="text-lg sm:text-xl font-black text-white font-display">
                    {config.prizePool || '10,000 RP + Título de Campeón'}
                  </h4>
                )}
              </div>
            </div>
          </div>

          {/* Rules List Section */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-cyan-400" />
                <span>Reglamento Oficial ({rules.length} Reglas)</span>
              </h4>

              {isEditing && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetDefaultRules}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-slate-800"
                    title="Restablecer reglas originales"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restablecer</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleAddRule}
                    className="text-xs font-bold text-cyan-400 hover:text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-500/40 px-3 py-1 rounded-xl flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Regla</span>
                  </button>
                </div>
              )}
            </div>

            {rules.map((rule, idx) => (
              <div
                key={idx}
                className="bg-[#090d16] border border-slate-800 hover:border-slate-700/80 p-4 sm:p-4.5 rounded-2xl space-y-2.5 transition-all relative group"
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/40 text-xs flex items-center justify-center font-mono font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        required
                        placeholder="Título de la regla (ej: Solo Queue Obligatorio)"
                        value={rule.title}
                        onChange={(e) => handleUpdateRule(idx, 'title', e.target.value)}
                        className="flex-1 bg-[#080b12] border border-slate-700 rounded-xl px-3 py-1.5 text-xs sm:text-sm font-bold text-white focus:outline-none focus:border-cyan-400"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteRule(idx)}
                        className="p-1.5 rounded-xl text-slate-500 hover:text-red-400 hover:bg-red-950/40 transition-colors"
                        title="Eliminar regla"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      required
                      placeholder="Descripción detallada de la regla..."
                      value={rule.description}
                      onChange={(e) => handleUpdateRule(idx, 'description', e.target.value)}
                      className="w-full bg-[#080b12] border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-400 resize-y"
                    />
                  </div>
                ) : (
                  <>
                    <h5 className="text-sm font-bold text-cyan-300 flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-500/40 text-xs flex items-center justify-center font-mono font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span>{rule.title}</span>
                    </h5>
                    <p className="text-xs sm:text-[13px] text-slate-300 pl-8 leading-relaxed">
                      {rule.description}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-black transition-all shadow-neon-gold flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-black transition-all shadow-neon-cyan flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Entendido</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
