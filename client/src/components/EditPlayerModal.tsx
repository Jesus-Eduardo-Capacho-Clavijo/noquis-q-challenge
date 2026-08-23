import React, { useState, useEffect, useRef } from 'react';
import { Player, LoLRole } from '../types';
import { RoleIcon } from './RoleIcon';
import { processImageFile } from '../utils/imageUtils';
import { COUNTRIES } from '../data/countries';
import { getCountryFlagUrl } from '../data/ddragon';
import { X, Edit2, Image as ImageIcon, Upload, Link, Trash2 } from 'lucide-react';

interface EditPlayerModalProps {
  player: Player | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<Player>) => Promise<void>;
}

export const EditPlayerModal: React.FC<EditPlayerModalProps> = ({
  player,
  isOpen,
  onClose,
  onSave,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<LoLRole>('MID');
  const [countryCode, setCountryCode] = useState('es');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (player) {
      setDisplayName(player.displayName || player.gameName);
      setRole(player.primaryRole || 'MID');
      setCountryCode(player.countryCode || 'es');
      setAvatarUrl(player.avatarUrl || '');
      setErrorMessage('');
    }
  }, [player]);

  if (!isOpen || !player) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setErrorMessage('');
    try {
      const dataUrl = await processImageFile(file);
      setAvatarUrl(dataUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar la imagen seleccionada.');
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    setErrorMessage('');
    try {
      const dataUrl = await processImageFile(file);
      setAvatarUrl(dataUrl);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error al procesar la imagen.');
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave(player.id, {
        displayName,
        primaryRole: role,
        countryCode,
        avatarUrl: avatarUrl.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0e1422] border border-slate-700/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 sm:py-5 border-b border-slate-800 bg-[#090d16] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Edit2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Editar Participante</h3>
              <p className="text-xs text-slate-400 font-mono">
                {player.gameName}#{player.tagLine}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-5 overflow-y-auto overflow-x-hidden flex-1">
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/50 text-xs text-red-200">
              {errorMessage}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Apodo / Nombre Visible
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-[#080b12] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Custom Avatar Section with Local Upload */}
          <div className="bg-[#090d16] p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Foto o Avatar del Jugador (Local o URL)</span>
              </label>
              <button
                type="button"
                onClick={() => setIsUrlMode(!isUrlMode)}
                className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-slate-800/60"
              >
                {isUrlMode ? <Upload className="w-3 h-3" /> : <Link className="w-3 h-3" />}
                <span>{isUrlMode ? 'Subir archivo local' : 'Pegar enlace URL'}</span>
              </button>
            </div>

            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/jpg, image/webp, image/gif"
              onChange={handleFileUpload}
              className="hidden"
            />

            <div className="flex items-center gap-4">
              {/* Preview Avatar Box with Drag & Drop */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => !avatarUrl && fileInputRef.current?.click()}
                className={`w-16 h-16 rounded-2xl bg-slate-900 border-2 ${
                  avatarUrl ? 'border-cyan-400 shadow-neon-cyan' : 'border-dashed border-slate-700 hover:border-cyan-400'
                } flex items-center justify-center shrink-0 overflow-hidden relative shadow-inner cursor-pointer group transition-all`}
                title={avatarUrl ? 'Foto personalizada cargada' : 'Haz clic o arrastra una imagen aquí'}
              >
                {isProcessingImage ? (
                  <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                ) : avatarUrl ? (
                  <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 group-hover:text-cyan-400">
                    <Upload className="w-5 h-5" />
                    <span className="text-[9px] font-bold mt-0.5 uppercase">Subir</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex-1 space-y-2">
                {isUrlMode ? (
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/foto.png"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full bg-[#080b12] border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                  />
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 flex items-center gap-2 transition-all shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{avatarUrl ? 'Cambiar imagen' : 'Seleccionar foto de mi PC'}</span>
                    </button>

                    {avatarUrl && (
                      <button
                        type="button"
                        onClick={() => setAvatarUrl('')}
                        className="px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-500/30 flex items-center gap-1.5 transition-colors"
                        title="Quitar foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Quitar foto</span>
                      </button>
                    )}
                  </div>
                )}
                <p className="text-[11px] text-slate-500">
                  {avatarUrl
                    ? '✓ Foto personalizada activa junto al icono de LoL en mismo tamaño.'
                    : 'Selecciona una foto PNG, JPG, WEBP de tu computadora.'}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Rol Principal
            </label>
            <div className="grid grid-cols-5 gap-1.5 bg-[#080b12] p-1.5 rounded-xl border border-slate-700">
              {(['TOP', 'JNG', 'MID', 'ADC', 'SUP'] as LoLRole[]).map((r) => (
                <button
                  type="button"
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex flex-col items-center justify-center py-2 rounded-lg text-xs font-bold transition-all ${
                    role === r
                      ? 'bg-cyan-500 text-black shadow-neon-cyan'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <RoleIcon
                    role={r}
                    size={18}
                    className={role === r ? 'brightness-0' : 'brightness-125'}
                  />
                  <span className="text-[10px] mt-1 font-semibold">{r}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Bandera / País
            </label>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-8 rounded-lg border border-slate-700 bg-slate-900 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                <img
                  src={getCountryFlagUrl(countryCode)}
                  alt={countryCode}
                  className="w-full h-full object-cover"
                  title={`Bandera: ${countryCode.toUpperCase()}`}
                />
              </div>
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="flex-1 bg-[#080b12] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 cursor-pointer min-w-0"
              >
                <optgroup label="Latinoamérica">
                  {COUNTRIES.filter((c) => c.region === 'LATAM').map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.code.toUpperCase()})
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Otros Países">
                  {COUNTRIES.filter((c) => c.region === 'OTROS').map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.name} ({c.code.toUpperCase()})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-all shadow-neon-cyan"
            >
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
