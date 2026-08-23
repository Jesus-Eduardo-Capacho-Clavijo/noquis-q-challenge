import React, { useState, useRef } from 'react';
import { LoLRole, RegionRouting } from '../types';
import { RoleIcon } from './RoleIcon';
import { processImageFile } from '../utils/imageUtils';
import { COUNTRIES } from '../data/countries';
import { getCountryFlagUrl } from '../data/ddragon';
import { X, UserPlus, AlertCircle, Image as ImageIcon, Upload, Link, Trash2 } from 'lucide-react';

interface AddPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPlayer: (playerData: {
    gameName: string;
    tagLine: string;
    region: RegionRouting;
    primaryRole: LoLRole;
    displayName?: string;
    countryCode: string;
    avatarUrl?: string;
    aegisCount?: number;
    shellsCount?: number;
  }) => Promise<void>;
  hasApiKey: boolean;
}

export const AddPlayerModal: React.FC<AddPlayerModalProps> = ({
  isOpen,
  onClose,
  onAddPlayer,
  hasApiKey,
}) => {
  const [riotIdInput, setRiotIdInput] = useState('');
  const [region, setRegion] = useState<RegionRouting>('la1');
  const [role, setRole] = useState<LoLRole>('MID');
  const [displayName, setDisplayName] = useState('');
  const [countryCode, setCountryCode] = useState('es');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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
    setErrorMessage('');

    if (!riotIdInput.includes('#')) {
      setErrorMessage('Ingresa el Riot ID completo en formato Nombre#TAG (ej. Faker#KR1 o Karemuv#LAN)');
      return;
    }

    const parts = riotIdInput.split('#');
    const gameName = parts[0].trim();
    const tagLine = parts[1].trim();

    if (!gameName || !tagLine) {
      setErrorMessage('El nombre y el tag no pueden estar vacíos.');
      return;
    }

    setIsLoading(true);
    try {
      await onAddPlayer({
        gameName,
        tagLine,
        region,
        primaryRole: role,
        displayName: displayName.trim() || gameName,
        countryCode,
        avatarUrl: avatarUrl.trim() || undefined,
        aegisCount: 0,
        shellsCount: 0,
      });

      // Reset form
      setRiotIdInput('');
      setDisplayName('');
      setAvatarUrl('');
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocurrió un error al añadir el jugador.');
    } finally {
      setIsLoading(false);
    }
  };

  const regions: { id: RegionRouting; name: string }[] = [
    { id: 'la1', name: 'LAN (Latinoamérica Norte)' },
    { id: 'la2', name: 'LAS (Latinoamérica Sur)' },
    { id: 'euw1', name: 'EUW (Europa Oeste)' },
    { id: 'na1', name: 'NA (Norteamérica)' },
    { id: 'kr', name: 'KR (Corea)' },
    { id: 'br1', name: 'BR (Brasil)' },
    { id: 'eun1', name: 'EUNE (Europa Nórdica y Este)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-[#0e1422] border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl shadow-cyan-950/40 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 sm:py-5 border-b border-slate-800 bg-[#090d16] shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-sm">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">Añadir Participante al Torneo</h3>
              <p className="text-xs text-slate-400">Ingresa la cuenta de Riot Games y personaliza su foto de perfil</p>
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
            <div className="p-3.5 rounded-xl bg-red-950/50 border border-red-500/50 text-xs text-red-200 flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Riot ID Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Riot ID (Nombre de Invocador # TAG) *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Faker#KR1 o Karemuv#LAN"
              value={riotIdInput}
              onChange={(e) => setRiotIdInput(e.target.value)}
              className="w-full bg-[#080b12] border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white font-mono placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
            />
          </div>

          {/* Display Name & Region */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Apodo / Nombre Visible
              </label>
              <input
                type="text"
                placeholder="Ej: Yisus, Karemuv"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-[#080b12] border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Servidor / Región *
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as RegionRouting)}
                className="w-full bg-[#080b12] border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Avatar with Local File Upload & Preview */}
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
                title={avatarUrl ? 'Foto cargada' : 'Haz clic o arrastra una imagen aquí'}
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

              {/* Upload action / URL input */}
              <div className="flex-1 space-y-2">
                {isUrlMode ? (
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/mi-foto.png"
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
                      <span>{avatarUrl ? 'Cambiar imagen de mi PC' : 'Seleccionar imagen de mi PC'}</span>
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
                    ? '✓ Foto cargada. Se mostrará junto al icono de LoL en mismo tamaño.'
                    : 'Formatos soportados: PNG, JPG, JPEG, WEBP o GIF de tu ordenador.'}
                </p>
              </div>
            </div>
          </div>

          {/* Role selection & Country */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Rol Principal en LoL
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
          </div>

          {/* Status info */}
          <div className="text-xs text-slate-400 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
            {hasApiKey ? (
              <span className="text-emerald-400 font-semibold">
                ✓ Se sincronizará en vivo con la API oficial de Riot Games (Rank SoloQ, LP, Winrate y Partidas).
              </span>
            ) : (
              <span className="text-amber-400 font-semibold">
                ⓘ Se generarán estadísticas de demostración. Podrás sincronizarlo con Riot Games tan pronto agregues tu API Key.
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-xl text-sm font-bold text-black bg-cyan-400 hover:bg-cyan-300 transition-all shadow-neon-cyan flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Consultando Riot Games...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Añadir al Ranking</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
