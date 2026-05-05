'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Topbar from '@/components/Topbar';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { getUserProfile, saveUserProfile, uploadProfilePhoto, signOut } from '@/lib/auth';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);

const ACCEPTED_IMAGE_TYPES = 'image/jpeg,image/png,image/webp';

function ProfilePreviewModal({ data, onClose }) {
  // data: { name, headline, price60, priceIntro, subjects, tags, bio, photoURL }
  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3l10 10M13 3L3 13"/>
          </svg>
        </button>
        <div className="aspect-video bg-slate-800 rounded-lg border border-slate-700 overflow-hidden mb-4">
          {data.photoURL
            ? <img src={data.photoURL} alt="Profile" className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">photo preview</div>
          }
        </div>
        <p className="text-lg font-semibold text-white">{data.name || 'Your name'}</p>
        <p className="text-xs text-slate-400 mt-1">{data.headline || 'Headline appears here'}</p>
        {data.subjects.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {data.subjects.map((s, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs text-indigo-300">
                {s.name}
              </span>
            ))}
          </div>
        )}
        {data.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {data.tags.map((t, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-400">
                {t}
              </span>
            ))}
          </div>
        )}
        {data.bio && (
          <p className="text-sm text-slate-400 mt-3 leading-relaxed line-clamp-4">{data.bio}</p>
        )}
        <hr className="border-slate-800 my-4" />
        <div className="flex justify-between items-end">
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wide">Price</p>
            <p className="text-xl font-semibold text-white mt-1">
              {data.price60 ? `€${data.price60}` : '—'}
              <span className="text-xs font-normal text-slate-500"> / 60 min</span>
            </p>
          </div>
          {data.priceIntro && (
            <span className="text-xs text-emerald-400 font-medium">Intro lesson free</span>
          )}
        </div>
        <button className="mt-4 w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors">
          Book a Lesson
        </button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user, role } = useAuth();
  const { t } = useLanguage();
  const router = useRouter();
  const isTeacher = role === 'teacher';
  const fileInputRef = useRef(null);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/login');
    } catch {
      setSigningOut(false);
    }
  };

  const [photoURL, setPhotoURL] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [headline, setHeadline] = useState('');
  const [price60, setPrice60] = useState('');
  const [priceIntro, setPriceIntro] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [bio, setBio] = useState('');
  const [avail, setAvail] = useState(new Set());
  const [grade, setGrade] = useState('');
  const [struggles, setStruggles] = useState('');
  const [expectations, setExpectations] = useState('');

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle | saved | error
  const [previewOpen, setPreviewOpen] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!user) return;
    getUserProfile(user.id).then(profile => {
      if (!profile) return;
      if (profile.photo_url) setPhotoURL(profile.photo_url);
      if (profile.name) setName(profile.name);
      if (profile.phone) setPhone(profile.phone);
      if (profile.headline) setHeadline(profile.headline);
      if (profile.price_60) setPrice60(String(profile.price_60));
      if (profile.price_intro !== undefined) setPriceIntro(profile.price_intro);
      if (profile.subjects) setSubjects(profile.subjects);
      if (profile.tags) setTags(profile.tags);
      if (profile.bio) setBio(profile.bio);
      if (profile.availability) setAvail(new Set(profile.availability));
      if (profile.grade) setGrade(profile.grade);
      if (profile.learning_struggles) setStruggles(profile.learning_struggles);
      if (profile.expectations) setExpectations(profile.expectations);
    }).catch(() => setLoadError('Failed to load profile.'));
  }, [user]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setPhotoUploading(true);
    try {
      const url = await uploadProfilePhoto(user.id, file);
      setPhotoURL(url);
    } catch {
      // silently ignore upload errors; user can retry
    } finally {
      setPhotoUploading(false);
      e.target.value = '';
    }
  };

  const toggleAvail = (d, h) => {
    const k = `${d}-${h}`;
    const ns = new Set(avail);
    ns.has(k) ? ns.delete(k) : ns.add(k);
    setAvail(ns);
  };

  const handleSave = async () => {
    if (!user) return;
    if (!phone.trim()) {
      setSaveStatus('error');
      setLoadError(t('profile.phoneRequired'));
      return;
    }
    setLoadError('');
    setSaving(true);
    setSaveStatus('idle');
    try {
      await saveUserProfile(user.id, {
        photo_url: photoURL,
        name,
        phone: phone.trim(),
        headline,
        price_60: price60 ? Number(price60) : null,
        price_intro: priceIntro,
        subjects,
        tags,
        bio,
        availability: [...avail],
        grade: grade.trim() || null,
        learning_struggles: struggles.trim() || null,
        expectations: expectations.trim() || null,
      });
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const addSubject = () => setSubjects(prev => [...prev, { name: '', grades: '' }]);

  const updateSubject = (i, field, value) =>
    setSubjects(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s));

  const removeSubject = (i) => setSubjects(prev => prev.filter((_, idx) => idx !== i));

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const trimmed = tagInput.trim();
      if (!tags.includes(trimmed)) setTags(prev => [...prev, trimmed]);
      setTagInput('');
    }
  };

  const removeTag = (t) => setTags(prev => prev.filter(x => x !== t));

  const previewData = { name, headline, price60, priceIntro, subjects, tags, bio, photoURL };

  return (
    <>
      {previewOpen && isTeacher && <ProfilePreviewModal data={previewData} onClose={() => setPreviewOpen(false)} />}
      <Topbar crumbs={[t('profile.crumb')]} />
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-mono text-slate-600 uppercase tracking-widest mb-1">{t('profile.kicker')}</p>
            <h1 className="text-2xl font-semibold tracking-tight text-white">{t('profile.title')}</h1>
            <p className="text-slate-500 text-sm mt-1">
              {isTeacher ? t('profile.subtitleTeacher') : t('profile.subtitleStudent')}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            {loadError && <p className="text-xs text-red-400">{loadError}</p>}
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-sm hover:bg-rose-500/10 hover:text-rose-300 hover:border-rose-500/30 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 3H3a1 1 0 00-1 1v8a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6"/>
              </svg>
              {signingOut ? t('common.saving') : t('nav.signOut')}
            </button>
            {isTeacher && (
              <button
                onClick={() => setPreviewOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-sm hover:bg-slate-800 transition-colors"
              >
                <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z"/>
                  <circle cx="8" cy="8" r="2"/>
                </svg>
                {t('profile.preview')}
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed
                ${saveStatus === 'saved' ? 'bg-emerald-600 text-white hover:bg-emerald-500' :
                  saveStatus === 'error' ? 'bg-red-600 text-white hover:bg-red-500' :
                  'bg-indigo-600 text-white hover:bg-indigo-500'}`}
            >
              {saveStatus === 'saved' ? (
                <>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8.5L6.5 12 13 4.5"/></svg>
                  {t('common.saved')}
                </>
              ) : saveStatus === 'error' ? t('common.error') : saving ? t('common.saving') : (
                <>
                  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8.5L6.5 12 13 4.5"/></svg>
                  {t('common.save')}
                </>
              )}
            </button>
          </div>
        </div>

        <div className={isTeacher ? 'grid grid-cols-[1fr_260px] gap-4' : 'max-w-2xl'}>
          <div className="space-y-4">

            {/* Basic info */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-1">{t('profile.basic')}</p>
              <div className="grid grid-cols-[120px_1fr] gap-5 mt-4">
                <div>
                  <p className="text-xs text-slate-500 mb-2">{t('profile.photo')}</p>
                  <div
                    className="w-[120px] h-[120px] rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-600 text-xs overflow-hidden cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {photoURL
                      ? <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                      : <span>1:1</span>
                    }
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES}
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={photoUploading}
                    className="mt-2 w-full text-xs px-2 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:bg-slate-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {photoUploading ? t('profile.uploading') : t('profile.upload')}
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">{t('profile.fullName')}</label>
                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-100 text-sm outline-none focus:border-indigo-500 transition-colors"
                      placeholder={t('profile.fullNamePh')}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">
                      {t('profile.phone')} <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-100 text-sm outline-none focus:border-indigo-500 transition-colors"
                      placeholder={t('profile.phonePh')}
                    />
                  </div>
                  {isTeacher && (
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5">{t('profile.headline')}</label>
                      <input
                        value={headline}
                        onChange={e => setHeadline(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-100 text-sm outline-none focus:border-indigo-500 transition-colors"
                        placeholder="e.g. Mathematics teacher · 8 years experience"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!isTeacher && (
              <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-1">{t('profile.aboutStudent')}</p>
                <p className="text-xs text-slate-500 mt-2 mb-4">
                  {t('profile.aboutStudentSub')}
                </p>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5">{t('profile.grade')}</label>
                    <input
                      value={grade}
                      onChange={e => setGrade(e.target.value.slice(0, 80))}
                      placeholder={t('profile.gradePh')}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-100 text-sm outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs text-slate-500">{t('profile.struggles')}</label>
                      <span className="text-[10px] font-mono text-slate-600">{struggles.length} / 500</span>
                    </div>
                    <textarea
                      rows={3}
                      value={struggles}
                      onChange={e => setStruggles(e.target.value.slice(0, 500))}
                      placeholder={t('profile.strugglesPh')}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-100 text-sm outline-none focus:border-indigo-500 transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs text-slate-500">{t('profile.expectations')}</label>
                      <span className="text-[10px] font-mono text-slate-600">{expectations.length} / 500</span>
                    </div>
                    <textarea
                      rows={3}
                      value={expectations}
                      onChange={e => setExpectations(e.target.value.slice(0, 500))}
                      placeholder={t('profile.expectationsPh')}
                      className="w-full px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-100 text-sm outline-none focus:border-indigo-500 transition-colors resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {isTeacher && (<>
            {/* Pricing */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest mb-4">02 — Pricing</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">Price per lesson (60 min)</label>
                  <div className="flex items-center bg-slate-800/60 border border-slate-700 rounded-lg overflow-hidden focus-within:border-indigo-500 transition-colors">
                    <span className="px-2.5 text-slate-500 text-sm">€</span>
                    <input
                      type="number"
                      min="0"
                      value={price60}
                      onChange={e => setPrice60(e.target.value)}
                      className="flex-1 py-2 bg-transparent text-slate-100 text-sm outline-none min-w-0"
                      placeholder="0"
                    />
                    <span className="px-2.5 text-slate-600 text-xs font-mono">/ 60 min</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1.5">Intro lesson</label>
                  <button
                    type="button"
                    onClick={() => setPriceIntro(p => !p)}
                    className={`w-full py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${priceIntro ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-400' : 'bg-slate-800/60 border-slate-700 text-slate-500 hover:border-slate-600'}`}
                  >
                    {priceIntro ? 'Free intro ✓' : 'Free intro?'}
                  </button>
                </div>
              </div>
            </div>

            {/* Subjects */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">03 — Subjects & Modules</p>
                <button
                  onClick={addSubject}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 text-xs hover:bg-slate-700 transition-colors"
                >
                  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 3v10M3 8h10"/></svg>
                  Add subject
                </button>
              </div>
              {subjects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-slate-600">
                  <p className="text-xs">No subjects added yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {subjects.map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        value={s.name}
                        onChange={e => updateSubject(i, 'name', e.target.value)}
                        placeholder="Subject (e.g. Mathematics)"
                        className="flex-1 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-100 text-sm outline-none focus:border-indigo-500 transition-colors"
                      />
                      <input
                        value={s.grades}
                        onChange={e => updateSubject(i, 'grades', e.target.value)}
                        placeholder="Grades (e.g. 9–12)"
                        className="w-36 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-100 text-sm outline-none focus:border-indigo-500 transition-colors"
                      />
                      <button
                        onClick={() => removeSubject(i)}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 3l10 10M13 3L3 13"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <p className="text-xs text-slate-500 mb-2">Topic tags</p>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map(t => (
                    <span key={t} className="flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300">
                      {t}
                      <button onClick={() => removeTag(t)} className="text-slate-500 hover:text-red-400 transition-colors">
                        <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3l10 10M13 3L3 13"/></svg>
                      </button>
                    </span>
                  ))}
                  <input
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="+ add tag, press Enter"
                    className="px-2 py-0.5 text-xs bg-transparent text-slate-400 outline-none placeholder-slate-600 w-36"
                  />
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">04 — Availability</p>
              </div>
              <p className="text-xs text-slate-600 mb-4 mt-2">Click cells to mark when you're free. Students can only book in marked slots.</p>
              <div className="overflow-x-auto">
                <div className="grid" style={{ gridTemplateColumns: '40px repeat(7, 1fr)', minWidth: 480 }}>
                  <div className="h-7" />
                  {DAYS.map(d => (
                    <div key={d} className="h-7 text-[10px] font-mono text-slate-500 flex items-center justify-center">{d}</div>
                  ))}
                  {HOURS.map(h => (
                    <React.Fragment key={h}>
                      <div className="text-[9px] font-mono text-slate-600 flex items-center justify-end pr-1.5" style={{ height: 28 }}>
                        {String(h).padStart(2, '0')}:00
                      </div>
                      {DAYS.map((_, d) => {
                        const k = `${d}-${h}`;
                        const on = avail.has(k);
                        return (
                          <button key={`c-${h}-${d}`} onClick={() => toggleAvail(d, h)}
                            className={`border border-slate-800 transition-colors ${on ? 'bg-indigo-500/30 hover:bg-indigo-500/40' : 'hover:bg-slate-800'}`}
                            style={{ height: 28 }} />
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <div className="flex gap-5 mt-3 text-xs text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-indigo-500/40" />Free</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-sm bg-slate-800 border border-slate-700" />Busy</span>
                <span className="ml-auto font-mono text-slate-600 text-[10px]">Timezone: Europe/Vilnius</span>
              </div>
            </div>

            {/* Bio */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">05 — About You</p>
                <span className="text-xs font-mono text-slate-500">{bio.length} / 800</span>
              </div>
              <textarea
                value={bio}
                onChange={e => setBio(e.target.value.slice(0, 800))}
                className="w-full px-3 py-3 rounded-lg bg-slate-800/60 border border-slate-700 text-slate-200 text-sm outline-none focus:border-indigo-500 transition-colors resize-none"
                rows={7}
                placeholder="Introduce yourself — your experience, teaching style, and what students can expect from your lessons."
              />
            </div>
            </>)}
          </div>

          {isTeacher && (
          /* Live preview sidebar */
          <div>
            <div className="bg-slate-900 rounded-xl border border-slate-800 p-5 sticky top-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-white">Public Preview</h2>
                <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                  <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
                    <path d="M1.5 8s2.5-4.5 6.5-4.5S14.5 8 14.5 8 12 12.5 8 12.5 1.5 8 1.5 8z"/>
                    <circle cx="8" cy="8" r="2"/>
                  </svg>
                  live
                </span>
              </div>
              <div className="aspect-video bg-slate-800 rounded-lg border border-slate-700 overflow-hidden mb-4">
                {photoURL
                  ? <img src={photoURL} alt="Profile" className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs">photo · 16:9</div>
                }
              </div>
              <p className="text-base font-semibold text-white">{name || <span className="text-slate-500">Your name</span>}</p>
              <p className="text-xs text-slate-400 mt-1">{headline || <span className="text-slate-600">Headline appears here</span>}</p>
              {subjects.length > 0 ? (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {subjects.filter(s => s.name).map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-xs text-indigo-300">{s.name}</span>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-600">No subjects yet</span>
                </div>
              )}
              <hr className="border-slate-800 my-4" />
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wide">Price</p>
                  <p className="text-lg font-semibold text-white mt-1">
                    {price60 ? `€${price60}` : <span className="text-slate-600">—</span>}
                    <span className="text-xs font-normal text-slate-500"> / 60 min</span>
                  </p>
                </div>
                {priceIntro && <span className="text-xs text-emerald-400 font-medium">Intro free</span>}
              </div>
              <button className="mt-4 w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors">
                Book a Lesson
              </button>
            </div>
          </div>
          )}
        </div>
      </div>
    </>
  );
}
