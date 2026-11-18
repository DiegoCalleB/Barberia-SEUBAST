import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Upload,
  Sparkles,
  RefreshCw,
  Info,
  CheckCircle2,
  Scissors,
  User,
  Loader2,
  Bookmark,
  Trash2,
  Heart,
  Download,
  SlidersHorizontal,
  Maximize2,
  ShoppingBag,
  Check,
  Columns,
  X,
  FileText
} from 'lucide-react';
import { analyzeFace, generateTryOn, StylistAnalysis } from '../services/geminiService';
import { HAIRCUT_STYLES, BEARD_STYLES, PRODUCTS } from '../constants';
import { useAuth } from '../lib/useAuth';
import { useCartStore } from '../lib/cartStore';
import { db, OperationType, handleFirestoreError, auth } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

export function AIStylist({ onBookStyle }: { onBookStyle: (id: string) => void }) {
  const [category, setCategory] = useState<'hair' | 'beard' | 'both'>('both');
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<StylistAnalysis | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(true);
  const [cameraStreamActive, setCameraStreamActive] = useState(false);
  const [showTryOn, setShowTryOn] = useState(false);
  const [selectedOverlay, setSelectedOverlay] = useState<string | null>(null);
  const [generatedLooks, setGeneratedLooks] = useState<Record<string, string>>({});
  const [generatedLooksSide, setGeneratedLooksSide] = useState<Record<string, string>>({});
  const [generatedLooksBack, setGeneratedLooksBack] = useState<Record<string, string>>({});
  const [isGeneratingTryOn, setIsGeneratingTryOn] = useState(false);
  const [generatingStyleId, setGeneratingStyleId] = useState<string | null>(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [perspective, setPerspective] = useState<'front' | 'side' | 'back'>('front');
  const [viewMode, setViewMode] = useState<'single' | 'gallery'>('single');
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Instant 120fps Before/After Split Slider refs (no React re-render on pointer move)
  const [compareMode, setCompareMode] = useState<'slider' | 'clean'>('slider');
  const sliderPosRef = useRef<number>(50);
  const isDraggingSliderRef = useRef<boolean>(false);
  const mirrorContainerRef = useRef<HTMLDivElement>(null);
  const sliderOverlayRef = useRef<HTMLImageElement>(null);
  const sliderHandleRef = useRef<HTMLDivElement>(null);

  // Custom selection & Quick Barber Modifiers state
  const [selectedHairId, setSelectedHairId] = useState<string>(HAIRCUT_STYLES[0].id);
  const [selectedBeardId, setSelectedBeardId] = useState<string>(BEARD_STYLES[0].id);
  const [fadeHeight, setFadeHeight] = useState<'estandar' | 'bajo' | 'medio' | 'alto'>('estandar');
  const [finishType, setFinishType] = useState<'natural' | 'texturizado' | 'pulido'>('natural');
  const [grayCamouflage, setGrayCamouflage] = useState<boolean>(false);
  const [customInstructions, setCustomInstructions] = useState<string>('');

  // Barber Full-Screen Card Modal & Boutique Cart feedback
  const [showBarberCardModal, setShowBarberCardModal] = useState(false);
  const [addedProductId, setAddedProductId] = useState<string | null>(null);
  const addItemToCart = useCartStore((state) => state.addItem);

  // Auth & Saved Looks States
  const { user } = useAuth();
  const [savedLooks, setSavedLooks] = useState<any[]>([]);
  const [isSavingLook, setIsSavingLook] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [showSavedTab, setShowSavedTab] = useState(false);
  const [compareLookId, setCompareLookId] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraFallbackInputRef = useRef<HTMLInputElement>(null);

  // Fetch saved looks from Firestore
  const fetchSavedLooks = async () => {
    if (!user) return;
    setIsLoadingSaved(true);
    try {
      const q = query(collection(db, 'saved_looks'), where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const looks = querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
      setSavedLooks(looks);
    } catch {
      // ignore fetch error
    } finally {
      setIsLoadingSaved(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchSavedLooks();
    } else {
      setSavedLooks([]);
    }
  }, [user]);

  const activeStyleKey = category === 'both'
    ? `${selectedHairId}+${selectedBeardId}`
    : category === 'hair'
      ? selectedHairId
      : selectedBeardId;

  const getStyleName = (id: string) => {
    const hairStyle = HAIRCUT_STYLES.find(s => s.id === id);
    if (hairStyle) return hairStyle.name;
    const beardStyle = BEARD_STYLES.find(s => s.id === id);
    if (beardStyle) return beardStyle.name;
    if (id.includes('+')) {
      const [hairId, beardId] = id.split('+');
      const hair = HAIRCUT_STYLES.find(s => s.id === hairId);
      const beard = BEARD_STYLES.find(s => s.id === beardId);
      return `${hair?.name || 'Cabello'} & ${beard?.name || 'Barba'}`;
    }
    return "Estilo Personalizado";
  };

  const getActiveBarberRecipe = (styleKey: string) => {
    let hairObj = HAIRCUT_STYLES.find(s => s.id === selectedHairId);
    let beardObj = BEARD_STYLES.find(s => s.id === selectedBeardId);

    if (styleKey.includes('+')) {
      const [hId, bId] = styleKey.split('+');
      hairObj = HAIRCUT_STYLES.find(s => s.id === hId) || hairObj;
      beardObj = BEARD_STYLES.find(s => s.id === bId) || beardObj;
    } else if (category === 'hair') {
      hairObj = HAIRCUT_STYLES.find(s => s.id === styleKey) || hairObj;
    } else if (category === 'beard') {
      beardObj = BEARD_STYLES.find(s => s.id === styleKey) || beardObj;
    }

    const fadeLabel =
      fadeHeight === 'bajo' ? ' (Degradado Bajo / Low Fade)' :
      fadeHeight === 'medio' ? ' (Degradado Medio / Mid Fade)' :
      fadeHeight === 'alto' ? ' (Degradado Alto / Skin Fade)' : '';

    const finishLabel =
      finishType === 'texturizado' ? ' · Acabado Mate Texturizado' :
      finishType === 'pulido' ? ' · Acabado Pulido con Brillo Sutil' : '';

    if (category === 'both' && hairObj && beardObj) {
      return {
        title: `${hairObj.name} + ${beardObj.name}`,
        clipperGuard: `Pelo: ${hairObj.barberRecipe.clipperGuard}${fadeLabel} | Barba: ${beardObj.barberRecipe.clipperGuard}`,
        scissorWork: `${hairObj.barberRecipe.scissorWork}${finishLabel}`,
        contours: `${hairObj.barberRecipe.contours} · ${beardObj.barberRecipe.contours}${grayCamouflage ? ' · Incluye Camuflaje de Canas' : ''}`,
        maintenanceDays: hairObj.barberRecipe.maintenanceDays,
        recommendedProductIds: [hairObj.recommendedProductId, beardObj.recommendedProductId]
      };
    }

    if (category === 'beard' && beardObj) {
      return {
        title: beardObj.name,
        clipperGuard: `${beardObj.barberRecipe.clipperGuard}${fadeLabel}`,
        scissorWork: `${beardObj.barberRecipe.scissorWork}${finishLabel}`,
        contours: `${beardObj.barberRecipe.contours}${grayCamouflage ? ' · Incluye Camuflaje de Canas' : ''}`,
        maintenanceDays: beardObj.barberRecipe.maintenanceDays,
        recommendedProductIds: [beardObj.recommendedProductId]
      };
    }

    const targetHair = hairObj || HAIRCUT_STYLES[0];
    return {
      title: targetHair.name,
      clipperGuard: `${targetHair.barberRecipe.clipperGuard}${fadeLabel}`,
      scissorWork: `${targetHair.barberRecipe.scissorWork}${finishLabel}`,
      contours: `${targetHair.barberRecipe.contours}${grayCamouflage ? ' · Incluye Camuflaje de Canas' : ''}`,
      maintenanceDays: targetHair.barberRecipe.maintenanceDays,
      recommendedProductIds: [targetHair.recommendedProductId]
    };
  };

  const currentStyleForRecipe = selectedOverlay || activeStyleKey;
  const activeRecipe = getActiveBarberRecipe(currentStyleForRecipe);

  const recommendedProducts = PRODUCTS.filter(p =>
    activeRecipe.recommendedProductIds.includes(p.id)
  );

  const buildModifierInstructions = () => {
    const parts: string[] = [];
    if (fadeHeight === 'bajo') parts.push('Apply a subtle Low Fade (degradado bajo cerca de la oreja).');
    if (fadeHeight === 'medio') parts.push('Apply a balanced Mid Fade (degradado a media altura).');
    if (fadeHeight === 'alto') parts.push('Apply a sharp High Skin Fade (degradado alto apurado a piel).');
    if (finishType === 'texturizado') parts.push('Give the hair a matte, choppy, highly textured finish with natural movement.');
    if (finishType === 'pulido') parts.push('Give the hair and beard a neat, classic, cleanly combed and polished finish.');
    if (grayCamouflage) parts.push('Blend and camouflage any gray hairs for a rejuvenated, uniform natural dark tone.');
    if (customInstructions.trim()) parts.push(customInstructions.trim());
    return parts.join(' ');
  };

  const getCurrentGeneratedImage = () => {
    if (!selectedOverlay) return null;
    if (perspective === 'side') return generatedLooksSide[selectedOverlay] || null;
    if (perspective === 'back') return generatedLooksBack[selectedOverlay] || null;
    return generatedLooks[selectedOverlay] || null;
  };

  const activeGeneratedImage = getCurrentGeneratedImage();

  const handleDownloadLook = () => {
    const imgToDownload = activeGeneratedImage || image;
    if (!imgToDownload) return;
    const link = document.createElement('a');
    const cleanName = getStyleName(currentStyleForRecipe)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    link.href = imgToDownload;
    link.download = `seubast-look-${cleanName}-${perspective}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveLook = async () => {
    if (!user) {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch {
        // ignore popup cancel
      }
      return;
    }
    if (!selectedOverlay || !image || !activeGeneratedImage) return;

    const alreadySaved = savedLooks.find(l => l.styleId === selectedOverlay && l.perspective === perspective);
    if (alreadySaved) {
      await handleDeleteLook(alreadySaved.id);
      return;
    }

    setIsSavingLook(true);
    try {
      const payload = {
        uid: user.uid,
        styleId: selectedOverlay,
        styleName: getStyleName(selectedOverlay),
        category: category,
        originalImage: image,
        generatedImage: activeGeneratedImage,
        perspective: perspective,
        createdAt: new Date()
      };

      const docRef = await addDoc(collection(db, 'saved_looks'), {
        ...payload,
        createdAt: serverTimestamp()
      });

      setSavedLooks(prev => [...prev, { id: docRef.id, ...payload }]);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'saved_looks');
    } finally {
      setIsSavingLook(false);
    }
  };

  const handleDeleteLook = async (lookId: string) => {
    try {
      await deleteDoc(doc(db, 'saved_looks', lookId));
      setSavedLooks(prev => prev.filter(look => look.id !== lookId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'saved_looks');
    }
  };

  const getEstimates = () => {
    let totalPrice = 0;
    let totalDuration = 0;

    if (category === 'hair' || category === 'both') {
      const hair = HAIRCUT_STYLES.find(s => s.id === selectedHairId);
      if (hair) {
        totalPrice += hair.price || 0;
        totalDuration += hair.duration || 0;
      }
    }

    if (category === 'beard' || category === 'both') {
      const beard = BEARD_STYLES.find(s => s.id === selectedBeardId);
      if (beard) {
        totalPrice += beard.price || 0;
        totalDuration += beard.duration || 0;
      }
    }

    if (category === 'both') {
      totalPrice = totalPrice * 0.85;
      totalDuration = Math.max(totalDuration - 10, 30);
    }

    if (grayCamouflage) {
      totalPrice += 10;
      totalDuration += 10;
    }

    return { price: Math.round(totalPrice).toFixed(2).replace(/\.00$/, ''), duration: totalDuration };
  };

  const estimates = getEstimates();

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCameraStreamActive(false);
    setIsCameraOpen(false);
  };

  // Start camera directly; if silentInit is true (on mount), do not trigger file picker on permission block
  const startCamera = async (silentInit: boolean = false) => {
    setIsCameraOpen(true);
    setGenerationError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraStreamActive(false);
        if (!silentInit) {
          cameraFallbackInputRef.current?.click();
        }
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } }
      });
      streamRef.current = stream;
      setCameraStreamActive(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      } else {
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }, 50);
      }
    } catch {
      // Never call console.error here so preview iframes that block auto-camera do not trigger runtime error banners
      setCameraStreamActive(false);
      if (!silentInit) {
        cameraFallbackInputRef.current?.click();
      }
    }
  };

  // Open camera immediately on mount as requested by the user
  useEffect(() => {
    startCamera(true);
    return () => stopCamera();
  }, []);

  // Zero-lag direct DOM manipulation for the Before/After Curtain (120fps, no React re-renders on move)
  const updateSliderFromClientX = (clientX: number) => {
    if (!mirrorContainerRef.current) return;
    const rect = mirrorContainerRef.current.getBoundingClientRect();
    if (!rect.width) return;
    const relX = clientX - rect.left;
    const pct = Math.max(2, Math.min(98, (relX / rect.width) * 100));
    sliderPosRef.current = pct;

    if (sliderOverlayRef.current) {
      sliderOverlayRef.current.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
    }
    if (sliderHandleRef.current) {
      sliderHandleRef.current.style.left = `${pct}%`;
    }
  };

  const capturePhotoFromVideo = (): string | null => {
    if (videoRef.current && canvasRef.current && videoRef.current.videoWidth > 0) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        // Mirror horizontally so the captured selfie matches what the user sees in the mirror
        context.save();
        context.translate(canvasRef.current.width, 0);
        context.scale(-1, 1);
        context.drawImage(videoRef.current, 0, 0);
        context.restore();
        const dataUrl = canvasRef.current.toDataURL('image/jpeg', 0.92);
        setImage(dataUrl);
        setShowTryOn(false);
        setSelectedOverlay(null);
        setGeneratedLooks({});
        setGeneratedLooksSide({});
        setGeneratedLooksBack({});
        setAnalysis(null);
        stopCamera();
        return dataUrl;
      }
    }
    return null;
  };

  const capturePhoto = () => {
    capturePhotoFromVideo();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      stopCamera();
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setShowTryOn(false);
        setSelectedOverlay(null);
        setGeneratedLooks({});
        setGeneratedLooksSide({});
        setGeneratedLooksBack({});
        setAnalysis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (newCat: 'hair' | 'beard' | 'both') => {
    setCategory(newCat);
    const nextOverlay = newCat === 'both'
      ? `${selectedHairId}+${selectedBeardId}`
      : newCat === 'hair'
        ? selectedHairId
        : selectedBeardId;

    if (generatedLooks[nextOverlay]) {
      setSelectedOverlay(nextOverlay);
      setShowTryOn(true);
    } else {
      setShowTryOn(false);
    }
  };

  const handleAnalyze = async () => {
    let sourceImage = image;
    if ((!sourceImage || isCameraOpen) && cameraStreamActive) {
      sourceImage = capturePhotoFromVideo();
    }
    if (!sourceImage) {
      startCamera(false);
      return;
    }

    setIsAnalyzing(true);
    setGenerationError(null);
    try {
      const result = await analyzeFace(sourceImage, category);
      setAnalysis(result);

      if (result.recommendations && result.recommendations.length > 0) {
        const topRec = result.recommendations[0];
        if (category === 'both' && topRec.styleId.includes('+')) {
          const [hairId, beardId] = topRec.styleId.split('+');
          if (HAIRCUT_STYLES.some(s => s.id === hairId)) setSelectedHairId(hairId);
          if (BEARD_STYLES.some(s => s.id === beardId)) setSelectedBeardId(beardId);
        } else if (category === 'hair') {
          if (HAIRCUT_STYLES.some(s => s.id === topRec.styleId)) setSelectedHairId(topRec.styleId);
        } else if (category === 'beard') {
          if (BEARD_STYLES.some(s => s.id === topRec.styleId)) setSelectedBeardId(topRec.styleId);
        }

        handleTryOn(topRec.styleId, undefined, false, sourceImage);
      }
    } catch {
      setGenerationError("No se pudo completar el diagnóstico facial. Hazte una foto frontal con buena iluminación.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleTryOn = async (
    styleId?: string,
    overridePerspective?: 'front' | 'side' | 'back',
    forceRegenerate: boolean = false,
    explicitImage?: string
  ) => {
    let sourceImage = explicitImage || image;
    if ((!sourceImage || isCameraOpen) && cameraStreamActive) {
      sourceImage = capturePhotoFromVideo();
    }
    if (!sourceImage) {
      startCamera(false);
      return;
    }

    const finalStyleId = styleId || activeStyleKey;
    const targetPerspective = overridePerspective || perspective;

    if (styleId) {
      if (styleId.includes('+')) {
        const [hId, bId] = styleId.split('+');
        if (HAIRCUT_STYLES.some(s => s.id === hId)) setSelectedHairId(hId);
        if (BEARD_STYLES.some(s => s.id === bId)) setSelectedBeardId(bId);
      } else if (HAIRCUT_STYLES.some(s => s.id === styleId)) {
        setSelectedHairId(styleId);
      } else if (BEARD_STYLES.some(s => s.id === styleId)) {
        setSelectedBeardId(styleId);
      }
    }

    let targetLooksDict = generatedLooks;
    if (targetPerspective === 'side') targetLooksDict = generatedLooksSide;
    if (targetPerspective === 'back') targetLooksDict = generatedLooksBack;

    if (!forceRegenerate && targetLooksDict[finalStyleId]) {
      setSelectedOverlay(finalStyleId);
      setViewMode('single');
      setShowTryOn(true);
      if (overridePerspective) setPerspective(overridePerspective);
      return;
    }

    let styleName = "";
    let styleInstruction = "";
    if (finalStyleId.includes('+')) {
      const [hairId, beardId] = finalStyleId.split('+');
      const hairStyle = HAIRCUT_STYLES.find(s => s.id === hairId);
      const beardStyle = BEARD_STYLES.find(s => s.id === beardId);
      styleName = `${hairStyle?.name || hairId} & ${beardStyle?.name || beardId}`;
      styleInstruction = `${hairStyle?.aiPrompt || ''} \n ${beardStyle?.aiPrompt || ''}`.trim();
    } else {
      const hairStyle = HAIRCUT_STYLES.find(s => s.id === finalStyleId);
      const beardStyle = BEARD_STYLES.find(s => s.id === finalStyleId);
      const style = hairStyle || beardStyle;
      if (!style) return;
      styleName = style.name;
      styleInstruction = style.aiPrompt || '';
    }

    setGeneratingStyleId(finalStyleId);
    setIsGeneratingTryOn(true);
    setGenerationError(null);
    setShowTryOn(true);
    if (overridePerspective) setPerspective(overridePerspective);

    try {
      const fullCustomInstructions = buildModifierInstructions();
      const targetCat = finalStyleId.includes('+')
        ? 'both'
        : HAIRCUT_STYLES.some(s => s.id === finalStyleId)
          ? 'hair'
          : 'beard';

      const result = await generateTryOn(
        sourceImage,
        styleName,
        targetCat,
        fullCustomInstructions,
        styleInstruction,
        targetPerspective
      );

      if (targetPerspective === 'side') {
        setGeneratedLooksSide(prev => ({ ...prev, [finalStyleId]: result }));
      } else if (targetPerspective === 'back') {
        setGeneratedLooksBack(prev => ({ ...prev, [finalStyleId]: result }));
      } else {
        setGeneratedLooks(prev => ({ ...prev, [finalStyleId]: result }));
      }

      sliderPosRef.current = 50;
      setSelectedOverlay(finalStyleId);
      setViewMode('single');
    } catch (err: any) {
      setGenerationError(err.message || "Error al generar la simulación. Inténtalo de nuevo con una foto clara.");
    } finally {
      setIsGeneratingTryOn(false);
      setGeneratingStyleId(null);
    }
  };

  return (
    <section id="ai-stylist" className="pt-24 pb-16 md:pt-28 md:pb-20 bg-surface relative overflow-hidden">
      {/* Subtle Ambient Glow */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-7xl">
        {/* Compact Direct Header (No extra filter button bars blocking the mirror) */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <span className="font-label uppercase tracking-[0.3em] text-xs text-primary font-bold block mb-2">
              Visagismo & Prueba en Tiempo Real
            </span>
            <h2 className="serif-display text-3xl md:text-5xl text-on-surface [text-wrap:balance]">
              Espejo Virtual <span className="italic text-primary">IA</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {showSavedTab ? (
              <button
                onClick={() => setShowSavedTab(false)}
                className="bg-primary text-on-primary px-5 py-2.5 rounded-xl text-xs font-label uppercase tracking-wider font-bold transition-all shadow-md"
              >
                Volver al Espejo
              </button>
            ) : (
              <button
                onClick={() => setShowSavedTab(true)}
                className="bg-surface-container-high hover:bg-primary/15 text-on-surface border border-outline-variant/20 px-4 py-2.5 rounded-xl text-xs font-label uppercase tracking-wider font-bold transition-all flex items-center gap-2"
              >
                <Heart size={14} className={savedLooks.length > 0 ? "fill-red-500 text-red-500" : "text-primary"} />
                <span>Looks Guardados ({savedLooks.length})</span>
              </button>
            )}
          </div>
        </div>

        {/* Hidden File & Camera Inputs */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*"
        />
        <input
          type="file"
          ref={cameraFallbackInputRef}
          onChange={handleFileUpload}
          className="hidden"
          accept="image/*"
          capture="user"
        />

        <AnimatePresence mode="wait">
          {!showSavedTab ? (
            <motion.div
              key="mirror-grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              {/* LEFT COLUMN: DIRECT CAMERA & VIRTUAL MIRROR */}
              <div className="lg:col-span-7 space-y-4">
                <div
                  ref={mirrorContainerRef}
                  className="relative min-h-[540px] md:min-h-[660px] bg-surface-container-high rounded-2xl border border-outline-variant/20 overflow-hidden shadow-2xl select-none flex flex-col"
                >
                  {isCameraOpen || !image ? (
                    <div className="relative flex-1 bg-black flex flex-col min-h-[540px] md:min-h-[660px]">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover scale-x-[-1] flex-1 ${
                          cameraStreamActive ? 'opacity-100' : 'opacity-0 absolute inset-0'
                        }`}
                      />

                      {/* Face Framing Guide Overlay */}
                      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
                        <div className="w-56 h-72 md:w-64 md:h-80 border-2 border-dashed border-primary/60 rounded-full shadow-[0_0_40px_rgba(0,0,0,0.6)]" />
                      </div>

                      {/* Top Action Bar inside Camera Mode */}
                      <div className="absolute top-4 inset-x-4 flex items-center justify-between gap-2 z-20">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-black/75 hover:bg-black text-white px-3.5 py-2 rounded-lg text-xs font-label uppercase tracking-wider border border-white/15 flex items-center gap-1.5 transition-all shadow-lg"
                        >
                          <Upload size={14} className="text-primary" />
                          <span>Subir de Galería</span>
                        </button>

                        {image && (
                          <button
                            onClick={stopCamera}
                            className="bg-black/75 hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-label uppercase tracking-wider border border-white/15"
                          >
                            Ver mi Foto
                          </button>
                        )}
                      </div>

                      {/* If browser/iframe needs one tap to grant camera permission or open native selfie camera */}
                      {!cameraStreamActive ? (
                        <div className="relative z-20 flex-1 flex flex-col items-center justify-center p-6 text-center">
                          <div className="w-20 h-20 rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center text-primary mb-5 shadow-xl">
                            <Camera size={36} />
                          </div>
                          <h3 className="serif-display text-2xl md:text-3xl text-white mb-2">
                            Cámara del Espejo Lista
                          </h3>
                          <p className="text-white/70 text-xs md:text-sm max-w-sm mb-6 leading-relaxed">
                            Pulsa para encender tu cámara frontal o hacerte la foto al instante y probar cualquier corte o barba sobre tu rostro.
                          </p>
                          <div className="flex flex-col sm:flex-row items-center gap-3">
                            <button
                              onClick={() => startCamera(false)}
                              className="bg-primary text-on-primary px-7 py-4 rounded-xl font-label uppercase text-xs tracking-widest font-bold hover:scale-105 transition-all flex items-center gap-2.5 shadow-xl"
                            >
                              <Camera size={16} />
                              <span>Hacerme Foto Ahora</span>
                            </button>
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="bg-white/10 hover:bg-white/15 text-white border border-white/20 px-5 py-4 rounded-xl font-label uppercase text-xs tracking-wider font-bold transition-all flex items-center gap-2"
                            >
                              <Upload size={15} />
                              <span>Elegir Foto</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        /* Live Camera Shutter Controls */
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 z-20">
                          <button
                            onClick={capturePhoto}
                            className="w-20 h-20 rounded-full bg-white border-4 border-primary flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow-2xl"
                            title="Hacer Foto"
                          >
                            <div className="w-14 h-14 rounded-full bg-primary/25 border border-black/20 flex items-center justify-center">
                              <Camera size={24} className="text-black" />
                            </div>
                          </button>
                          <span className="text-white text-[11px] font-label uppercase tracking-widest bg-black/75 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/10">
                            Pulsa para Hacer tu Foto
                          </span>
                        </div>
                      )}
                    </div>
                  ) : viewMode === 'single' ? (
                    <div className="relative w-full flex-1 bg-black overflow-hidden flex flex-col min-h-[540px] md:min-h-[660px]">
                      {/* Main Mirror Viewport */}
                      <div className="relative flex-1 w-full h-full">
                        {image && showTryOn && activeGeneratedImage && compareMode === 'slider' && !showOriginal ? (
                          <div
                            className="relative w-full h-full min-h-[540px] md:min-h-[660px] cursor-ew-resize touch-none select-none"
                            onPointerDown={(e) => {
                              isDraggingSliderRef.current = true;
                              e.currentTarget.setPointerCapture(e.pointerId);
                              updateSliderFromClientX(e.clientX);
                            }}
                            onPointerMove={(e) => {
                              if (isDraggingSliderRef.current) {
                                updateSliderFromClientX(e.clientX);
                              }
                            }}
                            onPointerUp={(e) => {
                              isDraggingSliderRef.current = false;
                              if (e.currentTarget.hasPointerCapture(e.pointerId)) {
                                e.currentTarget.releasePointerCapture(e.pointerId);
                              }
                            }}
                            onPointerCancel={() => {
                              isDraggingSliderRef.current = false;
                            }}
                          >
                            <img
                              src={image}
                              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
                              alt="Tu Foto Original"
                              draggable={false}
                            />
                            <img
                              ref={sliderOverlayRef}
                              src={activeGeneratedImage}
                              style={{ clipPath: `inset(0 ${100 - sliderPosRef.current}% 0 0)` }}
                              className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none will-change-[clip-path]"
                              alt="Nuevo Look IA"
                              draggable={false}
                            />

                            <div className="absolute top-16 left-4 bg-primary text-on-primary px-2.5 py-1 rounded text-[10px] font-label uppercase tracking-wider font-bold shadow pointer-events-none">
                              Nuevo Look IA
                            </div>
                            <div className="absolute top-16 right-4 bg-black/70 text-white px-2.5 py-1 rounded text-[10px] font-label uppercase tracking-wider font-bold border border-white/15 pointer-events-none">
                              Tu Foto
                            </div>

                            <div
                              ref={sliderHandleRef}
                              style={{ left: `${sliderPosRef.current}%` }}
                              className="absolute inset-y-0 w-0.5 bg-primary shadow-[0_0_12px_rgba(233,193,118,0.9)] pointer-events-none z-20 will-change-[left]"
                            >
                              <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-xl border-2 border-black">
                                <Columns size={17} />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={
                              showTryOn && activeGeneratedImage && !showOriginal
                                ? activeGeneratedImage
                                : image
                            }
                            className="w-full h-full min-h-[540px] md:min-h-[660px] object-cover"
                            alt="Vista del Espejo"
                          />
                        )}

                        {/* Top Mirror Action Bar: Repeat Photo, Upload, Save, Compare & Barber Card */}
                        <div className="absolute top-4 inset-x-4 flex flex-wrap items-center justify-between gap-2 z-30">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startCamera(false)}
                              className="bg-primary text-on-primary hover:bg-primary/90 px-3.5 py-2 rounded-lg text-xs font-label uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all shadow-lg"
                            >
                              <Camera size={14} />
                              <span>Repetir Foto</span>
                            </button>

                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="bg-black/75 hover:bg-black text-white px-3.5 py-2 rounded-lg text-xs font-label uppercase tracking-wider border border-white/15 flex items-center gap-1.5 transition-all shadow-lg"
                            >
                              <Upload size={14} />
                              <span>Subir Otra</span>
                            </button>

                            {showTryOn && activeGeneratedImage && !isGeneratingTryOn && (
                              <button
                                onClick={handleSaveLook}
                                disabled={isSavingLook}
                                className="bg-black/75 hover:bg-primary hover:text-on-primary text-white px-3 py-2 rounded-lg text-xs font-label uppercase tracking-wider border border-white/15 transition-all shadow-lg flex items-center gap-1.5 disabled:opacity-50"
                              >
                                {isSavingLook ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Heart
                                    size={14}
                                    className={
                                      savedLooks.some(l => l.styleId === selectedOverlay && l.perspective === perspective)
                                        ? "fill-red-500 text-red-500"
                                        : ""
                                    }
                                  />
                                )}
                              </button>
                            )}
                          </div>

                          {showTryOn && activeGeneratedImage && !isGeneratingTryOn && (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setCompareMode(compareMode === 'slider' ? 'clean' : 'slider')}
                                className={`px-3.5 py-2 rounded-lg text-xs font-label uppercase tracking-wider font-bold border transition-all shadow-lg flex items-center gap-1.5 ${
                                  compareMode === 'slider'
                                    ? 'bg-primary text-on-primary border-primary'
                                    : 'bg-black/75 text-white border-white/15 hover:border-primary'
                                }`}
                              >
                                <Columns size={14} />
                                <span>{compareMode === 'slider' ? 'Cortina A/D' : 'Comparar'}</span>
                              </button>

                              <button
                                onClick={handleDownloadLook}
                                className="bg-black/75 hover:bg-primary hover:text-on-primary text-white p-2 rounded-lg border border-white/15 transition-all shadow-lg"
                                title="Descargar imagen en tu dispositivo"
                              >
                                <Download size={16} />
                              </button>

                              <button
                                onClick={() => setShowBarberCardModal(true)}
                                className="bg-black/75 hover:bg-primary hover:text-on-primary text-white px-3.5 py-2 rounded-lg text-xs font-label uppercase tracking-wider font-bold border border-white/15 transition-all shadow-lg flex items-center gap-1.5"
                                title="Pantalla completa para mostrar a tu barbero"
                              >
                                <Maximize2 size={14} />
                                <span className="hidden sm:inline">Ficha Barbero</span>
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Bottom Perspective Bar (When a Try-On is active) */}
                        {showTryOn && selectedOverlay && !isGeneratingTryOn && (
                          <div className="absolute bottom-4 inset-x-4 flex flex-col sm:flex-row items-center justify-between gap-3 z-30">
                            <div className="bg-black/80 backdrop-blur-xl p-1.5 rounded-xl border border-white/15 shadow-2xl flex items-center gap-1">
                              {(['front', 'side', 'back'] as const).map((angle) => {
                                const label = angle === 'front' ? 'Frente' : angle === 'side' ? 'Perfil' : 'Nuca';
                                const isCached =
                                  angle === 'front'
                                    ? Boolean(generatedLooks[selectedOverlay])
                                    : angle === 'side'
                                      ? Boolean(generatedLooksSide[selectedOverlay])
                                      : Boolean(generatedLooksBack[selectedOverlay]);

                                return (
                                  <button
                                    key={angle}
                                    onClick={() => {
                                      if (angle !== perspective) {
                                        if (angle !== 'front') setCompareMode('clean');
                                        handleTryOn(selectedOverlay, angle);
                                      }
                                    }}
                                    className={`px-4 py-2 rounded-lg text-xs font-label uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 ${
                                      perspective === angle
                                        ? 'bg-primary text-on-primary shadow'
                                        : 'text-white/80 hover:text-white hover:bg-white/10'
                                    }`}
                                  >
                                    <span>{label}</span>
                                    {isCached && (
                                      <Check size={12} className={perspective === angle ? 'text-on-primary' : 'text-primary'} />
                                    )}
                                  </button>
                                );
                              })}
                            </div>

                            {Object.keys(generatedLooks).length > 1 && (
                              <button
                                onClick={() => setViewMode('gallery')}
                                className="bg-black/80 backdrop-blur-xl text-white hover:text-primary px-4 py-2.5 rounded-xl border border-white/15 text-xs font-label uppercase tracking-wider font-bold shadow-xl transition-all"
                              >
                                Ver Mosaico ({Object.keys(generatedLooks).length})
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Gallery / Mosaic View of Generated Looks */
                    <div className="w-full h-full p-6 overflow-y-auto bg-surface-container-low flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="serif-display text-xl text-on-surface">Comparativa de Looks Probados</h4>
                        <button
                          onClick={() => setViewMode('single')}
                          className="text-xs font-label uppercase tracking-wider text-primary hover:underline flex items-center gap-1"
                        >
                          Volver al Espejo Único
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {image && (
                          <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-outline-variant/20 shadow-lg">
                            <img src={image} className="w-full h-full object-cover" alt="Original" />
                            <div className="absolute bottom-0 left-0 w-full bg-black/70 backdrop-blur-sm p-2.5 text-center">
                              <span className="text-xs text-white font-label uppercase tracking-wider">Foto Original</span>
                            </div>
                          </div>
                        )}
                        {Object.entries(generatedLooks).map(([styleKey, genImg]) => (
                          <div
                            key={styleKey}
                            onClick={() => {
                              setSelectedOverlay(styleKey);
                              setPerspective('front');
                              setViewMode('single');
                            }}
                            className={`relative aspect-[4/5] rounded-xl overflow-hidden border transition-all cursor-pointer ${
                              selectedOverlay === styleKey
                                ? 'border-primary ring-2 ring-primary/30'
                                : 'border-outline-variant/20 hover:border-primary/50'
                            }`}
                          >
                            <img src={genImg} className="w-full h-full object-cover" alt={getStyleName(styleKey)} />
                            <div className="absolute bottom-0 left-0 w-full bg-black/75 backdrop-blur-sm p-2.5 text-center">
                              <span className="text-xs text-white font-label uppercase tracking-wider font-bold">
                                {getStyleName(styleKey)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Loading Overlay */}
                  {(isAnalyzing || isGeneratingTryOn) && (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 z-40">
                      <Loader2 size={44} className="text-primary animate-spin mb-5" />
                      <h3 className="serif-display text-2xl text-white mb-2">
                        {isAnalyzing ? 'Analizando Estructura Facial...' : `Esculpiendo ${getStyleName(generatingStyleId || activeStyleKey)}...`}
                      </h3>
                      <p className="text-white/70 text-sm max-w-md">
                        {isAnalyzing
                          ? 'Estudiando proporciones de mandíbula, frente y densidad capilar para recomendarte tus 3 cortes ideales.'
                          : 'Aplicando el estilo sobre tu rostro respetando tus facciones e iluminación original.'}
                      </p>
                    </div>
                  )}

                  {/* Error Banner */}
                  {generationError && !isGeneratingTryOn && (
                    <div className="absolute inset-x-6 bottom-6 bg-red-950/95 border border-red-500/40 p-4 rounded-xl z-40 flex items-center justify-between gap-4 shadow-2xl">
                      <div className="flex items-center gap-3 text-left">
                        <Info size={18} className="text-red-300 shrink-0" />
                        <p className="text-white text-xs leading-relaxed">{generationError}</p>
                      </div>
                      <button
                        onClick={() => setGenerationError(null)}
                        className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-label uppercase tracking-wider shrink-0"
                      >
                        Cerrar
                      </button>
                    </div>
                  )}
                </div>
                <canvas ref={canvasRef} className="hidden" />
              </div>

              {/* RIGHT COLUMN: CONTROLS, VISUAL SELECTOR, BARBER RECIPE & BOUTIQUE */}
              <div className="lg:col-span-5 space-y-5">
                {/* 1. Style Configurator + Integrated Category Tabs */}
                <div className="bg-surface-container-high p-5 rounded-2xl border border-outline-variant/20 shadow-lg space-y-4">
                  {/* Integrated Category Selector inside the panel */}
                  <div className="grid grid-cols-3 gap-1 bg-surface p-1 rounded-xl border border-outline-variant/15">
                    {(['both', 'hair', 'beard'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`py-2 rounded-lg text-[11px] font-label uppercase tracking-wider font-bold transition-all ${
                          category === cat
                            ? 'bg-primary text-on-primary shadow'
                            : 'text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        {cat === 'both' ? 'Pelo + Barba' : cat === 'hair' ? 'Solo Pelo' : 'Solo Barba'}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <h3 className="serif-display text-lg text-on-surface">
                      Elige tu Estilo en el Espejo
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono tabular-nums text-primary font-bold">
                      <span>{estimates.duration} min</span>
                      <span>·</span>
                      <span>€{estimates.price}</span>
                    </div>
                  </div>

                  {/* Visual Thumbnail Strip for Haircuts */}
                  {(category === 'hair' || category === 'both') && (
                    <div>
                      <label className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-2 block">
                        Corte de Pelo: <span className="text-primary font-bold">{HAIRCUT_STYLES.find(s => s.id === selectedHairId)?.name}</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2 max-h-44 overflow-y-auto pr-1 [scrollbar-width:thin]">
                        {HAIRCUT_STYLES.map((style) => {
                          const isSelected = selectedHairId === style.id;
                          return (
                            <button
                              key={style.id}
                              onClick={() => setSelectedHairId(style.id)}
                              className={`group relative rounded-xl overflow-hidden border text-left transition-all ${
                                isSelected
                                  ? 'border-primary ring-2 ring-primary/30'
                                  : 'border-outline-variant/20 hover:border-primary/50 opacity-80 hover:opacity-100'
                              }`}
                            >
                              <div className="h-16 w-full bg-black relative">
                                <img
                                  src={style.image}
                                  alt={style.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <span className="absolute bottom-1.5 inset-x-1.5 text-[10px] font-medium text-white leading-tight line-clamp-1">
                                  {style.name.split('/')[0].trim()}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Visual Thumbnail Strip for Beards */}
                  {(category === 'beard' || category === 'both') && (
                    <div>
                      <label className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-2 block">
                        Estilo de Barba: <span className="text-primary font-bold">{BEARD_STYLES.find(s => s.id === selectedBeardId)?.name}</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto pr-1 [scrollbar-width:thin]">
                        {BEARD_STYLES.map((style) => {
                          const isSelected = selectedBeardId === style.id;
                          return (
                            <button
                              key={style.id}
                              onClick={() => setSelectedBeardId(style.id)}
                              className={`group relative rounded-xl overflow-hidden border text-left transition-all ${
                                isSelected
                                  ? 'border-primary ring-2 ring-primary/30'
                                  : 'border-outline-variant/20 hover:border-primary/50 opacity-80 hover:opacity-100'
                              }`}
                            >
                              <div className="h-16 w-full bg-black relative">
                                <img
                                  src={style.image}
                                  alt={style.name}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                <span className="absolute bottom-1.5 inset-x-1.5 text-[10px] font-medium text-white leading-tight line-clamp-1">
                                  {style.name.split('/')[0].trim()}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quick Barber Modifiers */}
                  <div className="pt-3 border-t border-outline-variant/15 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-label uppercase tracking-wider text-on-surface-variant font-bold">
                      <SlidersHorizontal size={13} className="text-primary" />
                      <span>Ajustes Rápidos de Barbería</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <span className="text-[11px] text-on-surface-variant block mb-1">Altura del Degradado</span>
                        <div className="grid grid-cols-4 gap-1 bg-surface p-1 rounded-lg border border-outline-variant/15">
                          {(['estandar', 'bajo', 'medio', 'alto'] as const).map((h) => (
                            <button
                              key={h}
                              onClick={() => setFadeHeight(h)}
                              className={`py-1.5 rounded text-[10px] font-label uppercase transition-all ${
                                fadeHeight === h
                                  ? 'bg-primary text-on-primary font-bold'
                                  : 'text-on-surface-variant hover:text-on-surface'
                              }`}
                            >
                              {h === 'estandar' ? 'Base' : h}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] text-on-surface-variant block mb-1">Acabado / Textura</span>
                        <div className="grid grid-cols-3 gap-1 bg-surface p-1 rounded-lg border border-outline-variant/15">
                          {(['natural', 'texturizado', 'pulido'] as const).map((f) => (
                            <button
                              key={f}
                              onClick={() => setFinishType(f)}
                              className={`py-1.5 rounded text-[10px] font-label uppercase transition-all ${
                                finishType === f
                                  ? 'bg-primary text-on-primary font-bold'
                                  : 'text-on-surface-variant hover:text-on-surface'
                              }`}
                            >
                              {f === 'texturizado' ? 'Textura' : f}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => setGrayCamouflage(!grayCamouflage)}
                        className={`px-3 py-1.5 rounded-lg border text-xs font-label transition-all flex items-center gap-2 ${
                          grayCamouflage
                            ? 'border-primary bg-primary/15 text-primary font-bold'
                            : 'border-outline-variant/20 bg-surface text-on-surface-variant hover:text-on-surface'
                        }`}
                      >
                        <CheckCircle2 size={14} />
                        <span>Incluir Camuflaje de Canas (+10€)</span>
                      </button>
                    </div>

                    <input
                      type="text"
                      value={customInstructions}
                      onChange={(e) => setCustomInstructions(e.target.value)}
                      placeholder="Nota opcional (ej: raya a la izquierda, patilla en punta...)"
                      className="w-full bg-surface border border-outline-variant/20 rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      <button
                        onClick={() => handleTryOn(activeStyleKey, perspective, true)}
                        disabled={isGeneratingTryOn}
                        className="bg-primary text-on-primary py-3.5 px-4 rounded-xl font-label uppercase text-xs tracking-wider font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-40"
                      >
                        {isGeneratingTryOn ? <Loader2 size={15} className="animate-spin" /> : <Scissors size={15} />}
                        <span>Probar en el Espejo</span>
                      </button>

                      <button
                        onClick={handleAnalyze}
                        disabled={isAnalyzing}
                        className="bg-surface hover:bg-primary/15 text-primary border border-primary/40 py-3.5 px-4 rounded-xl font-label uppercase text-xs tracking-wider font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                      >
                        {isAnalyzing ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                        <span>Diagnóstico Visagismo</span>
                      </button>
                    </div>
                  </div>

                  {/* AI Visagism Results (when triggered) */}
                  {analysis && (
                    <div className="pt-3 border-t border-outline-variant/15 space-y-2.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-primary uppercase tracking-wider">
                          Rostro {analysis.faceShape} · Pelo {analysis.hairType}
                        </span>
                      </div>
                      <p className="font-body text-xs text-on-surface-variant italic leading-relaxed">
                        "{analysis.advice}"
                      </p>
                      {analysis.recommendations && analysis.recommendations.length > 0 && (
                        <div className="grid grid-cols-1 gap-1.5 pt-1">
                          {analysis.recommendations.map((rec, idx) => (
                            <button
                              key={rec.styleId}
                              onClick={() => handleTryOn(rec.styleId)}
                              disabled={isGeneratingTryOn}
                              className={`w-full text-left p-2 rounded-lg border transition-all flex items-center justify-between gap-2 ${
                                selectedOverlay === rec.styleId
                                  ? 'border-primary bg-primary/10'
                                  : 'border-outline-variant/15 bg-surface hover:border-primary/40'
                              }`}
                            >
                              <span className="text-xs font-bold text-on-surface truncate">
                                <span className="text-primary font-mono mr-1.5">0{idx + 1}.</span>
                                {getStyleName(rec.styleId)}
                              </span>
                              <span className="text-[10px] font-label uppercase tracking-wider text-primary font-bold shrink-0">
                                {generatedLooks[rec.styleId] ? 'Ver' : 'Probar'}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Barber Technical Blueprint Card ("Ficha Técnica para tu Barbero") */}
                <div className="bg-surface-container-low p-5 rounded-2xl border border-primary/25 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-primary" />
                      <h4 className="serif-display text-base text-on-surface font-bold">
                        Ficha Técnica para tu Barbero
                      </h4>
                    </div>
                    <button
                      onClick={() => setShowBarberCardModal(true)}
                      className="text-xs font-label uppercase tracking-wider text-primary hover:underline flex items-center gap-1"
                    >
                      <Maximize2 size={12} />
                      <span>Ampliar</span>
                    </button>
                  </div>

                  <div className="space-y-2 text-xs bg-surface p-3.5 rounded-xl border border-outline-variant/15">
                    <div>
                      <span className="text-on-surface-variant font-bold">Máquina / Laterales: </span>
                      <span className="text-on-surface tabular-nums">{activeRecipe.clipperGuard}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant font-bold">Tijera / Zona Superior: </span>
                      <span className="text-on-surface tabular-nums">{activeRecipe.scissorWork}</span>
                    </div>
                    <div>
                      <span className="text-on-surface-variant font-bold">Contornos y Navaja: </span>
                      <span className="text-on-surface">{activeRecipe.contours}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1.5 border-t border-outline-variant/10 text-primary">
                      <span className="font-bold">Frecuencia óptima de retoque:</span>
                      <span className="font-mono tabular-nums font-bold">{activeRecipe.maintenanceDays}</span>
                    </div>
                    {analysis?.barberTechnicalTip && (
                      <div className="pt-1.5 border-t border-outline-variant/10 text-on-surface-variant italic">
                        <strong className="text-primary not-italic">Ajuste craneal IA: </strong>
                        {analysis.barberTechnicalTip}
                      </div>
                    )}
                  </div>

                  {/* Recommended Boutique Product for this Style */}
                  {recommendedProducts.length > 0 && (
                    <div className="pt-1">
                      <span className="text-[11px] font-label uppercase tracking-wider text-on-surface-variant block mb-2">
                        Producto de Mantenimiento Recomendado:
                      </span>
                      {recommendedProducts.slice(0, 1).map((prod) => (
                        <div
                          key={prod.id}
                          className="flex items-center justify-between gap-3 bg-surface p-2.5 rounded-xl border border-outline-variant/15"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={prod.image}
                              alt={prod.name}
                              className="w-11 h-11 rounded-lg object-cover shrink-0 bg-black"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0">
                              <h5 className="text-xs font-bold text-on-surface truncate">{prod.name}</h5>
                              <span className="text-xs font-mono tabular-nums text-primary font-bold">
                                €{prod.price}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              addItemToCart(prod);
                              setAddedProductId(prod.id);
                              setTimeout(() => setAddedProductId(null), 2000);
                            }}
                            className="bg-surface-container-high hover:bg-primary hover:text-on-primary text-on-surface border border-outline-variant/30 px-3 py-2 rounded-lg text-xs font-label uppercase tracking-wider font-bold transition-all flex items-center gap-1.5 shrink-0"
                          >
                            {addedProductId === prod.id ? (
                              <>
                                <Check size={13} className="text-primary" />
                                <span>Añadido</span>
                              </>
                            ) : (
                              <>
                                <ShoppingBag size={13} />
                                <span>Añadir</span>
                              </>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Primary Booking CTA */}
                  <button
                    data-custom-booking
                    onClick={() => onBookStyle(currentStyleForRecipe)}
                    className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary py-4 rounded-xl font-label uppercase text-xs tracking-widest font-bold hover:opacity-95 transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    <Scissors size={15} />
                    <span>Reservar Cita con este Estilo</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* SAVED LOOKS TAB */
            <motion.div
              key="saved-looks-grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-surface-container-high p-8 md:p-12 rounded-2xl border border-outline-variant/20 shadow-2xl"
            >
              {!user ? (
                <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-12">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Bookmark size={28} className="text-primary" />
                  </div>
                  <h3 className="serif-display text-2xl text-on-surface mb-3">Guarda tus Looks Favoritos</h3>
                  <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
                    Inicia sesión con tu cuenta de Google para guardar tus simulaciones y mostrárselas directamente a tu barbero en el sillón.
                  </p>
                  <button
                    onClick={async () => {
                      const provider = new GoogleAuthProvider();
                      try {
                        await signInWithPopup(auth, provider);
                      } catch (error) {
                        console.error('Login failed', error);
                      }
                    }}
                    className="bg-primary text-on-primary px-8 py-4 rounded-xl font-label uppercase text-xs tracking-widest font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2"
                  >
                    <User size={16} />
                    Iniciar Sesión con Google
                  </button>
                </div>
              ) : isLoadingSaved ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <Loader2 size={40} className="text-primary animate-spin mb-4" />
                  <p className="text-on-surface-variant text-sm font-label uppercase tracking-widest">Cargando tus looks...</p>
                </div>
              ) : savedLooks.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-12">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                    <Heart size={28} className="text-primary/40" />
                  </div>
                  <h3 className="serif-display text-2xl text-on-surface mb-3">Tu colección está vacía</h3>
                  <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
                    Aún no has guardado ningún look. Pruébate diferentes estilos en el Espejo Virtual y pulsa el icono de corazón para coleccionarlos aquí.
                  </p>
                  <button
                    onClick={() => setShowSavedTab(false)}
                    className="bg-primary text-on-primary px-8 py-4 rounded-xl font-label uppercase text-xs tracking-widest font-bold hover:bg-primary/90 transition-all shadow-lg"
                  >
                    Ir al Espejo Virtual
                  </button>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/10">
                    <div>
                      <h3 className="serif-display text-2xl text-on-surface">Mis Looks Guardados</h3>
                      <p className="text-on-surface-variant text-xs mt-1">
                        Tus simulaciones listas para enseñar en la barbería o reservar cita.
                      </p>
                    </div>
                    <span className="text-xs font-mono tabular-nums text-primary font-bold">
                      {savedLooks.length} {savedLooks.length === 1 ? 'Look' : 'Looks'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {savedLooks.map((look) => (
                      <div
                        key={look.id}
                        className="bg-surface border border-outline-variant/15 rounded-2xl overflow-hidden shadow-lg flex flex-col group relative"
                      >
                        <div className="relative aspect-[4/5] bg-black overflow-hidden">
                          <img
                            src={compareLookId === look.id ? look.originalImage : look.generatedImage}
                            alt={look.styleName}
                            className="w-full h-full object-cover transition-all duration-300"
                            referrerPolicy="no-referrer"
                          />

                          <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded text-[10px] font-label uppercase tracking-wider border border-white/10">
                            {look.perspective === 'front' ? 'Frente' : look.perspective === 'side' ? 'Perfil' : 'Nuca'}
                          </div>

                          <button
                            onClick={() => handleDeleteLook(look.id)}
                            className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-black/70 text-white hover:text-red-400 flex items-center justify-center border border-white/10 transition-all z-20"
                            title="Eliminar Look"
                          >
                            <Trash2 size={14} />
                          </button>

                          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
                            <button
                              onPointerDown={() => setCompareLookId(look.id)}
                              onPointerUp={() => setCompareLookId(null)}
                              onPointerLeave={() => setCompareLookId(null)}
                              className="bg-black/80 text-white text-[10px] font-label uppercase tracking-wider px-4 py-2 rounded-lg border border-white/20 hover:border-primary transition-all shadow-xl whitespace-nowrap"
                            >
                              {compareLookId === look.id ? 'Viendo Original' : 'Mantén para ver Antes'}
                            </button>
                          </div>
                        </div>

                        <div className="p-5 flex-grow flex flex-col justify-between">
                          <div>
                            <h4 className="serif-display text-lg text-on-surface mb-1">{look.styleName}</h4>
                            <p className="text-on-surface-variant text-xs mb-4">
                              {look.category === 'both' ? 'Pelo + Barba' : look.category === 'hair' ? 'Corte de Pelo' : 'Arreglo de Barba'}
                            </p>
                          </div>

                          <button
                            data-custom-booking
                            onClick={() => onBookStyle(look.styleId)}
                            className="w-full bg-primary text-on-primary py-3 rounded-xl font-label uppercase text-xs tracking-widest font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md"
                          >
                            <Scissors size={14} />
                            Reservar este Estilo
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FULL-SCREEN "ENSEÑAR AL BARBERO" TECHNICAL CARD MODAL */}
      <AnimatePresence>
        {showBarberCardModal && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBarberCardModal(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-3xl bg-surface-container-high border border-primary/40 rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between p-5 border-b border-outline-variant/20 bg-surface">
                <div>
                  <span className="text-[10px] font-label uppercase tracking-[0.25em] text-primary font-bold block">
                    SEUBAST · FICHA DE SILLÓN PARA EL BARBERO
                  </span>
                  <h3 className="serif-display text-2xl text-on-surface font-bold">
                    {activeRecipe.title}
                  </h3>
                </div>
                <button
                  onClick={() => setShowBarberCardModal(false)}
                  className="p-2 text-on-surface-variant hover:text-primary transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6">
                {image && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="relative aspect-[4/5] rounded-xl overflow-hidden border border-outline-variant/20 bg-black">
                      <img src={image} alt="Antes" className="w-full h-full object-cover" />
                      <span className="absolute top-3 left-3 bg-black/75 text-white px-3 py-1 rounded text-xs font-label uppercase tracking-wider">
                        Estado Inicial
                      </span>
                    </div>
                    <div className="relative aspect-[4/5] rounded-xl overflow-hidden border-2 border-primary bg-black">
                      <img
                        src={activeGeneratedImage || image}
                        alt="Resultado Objetivo"
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute top-3 left-3 bg-primary text-on-primary px-3 py-1 rounded text-xs font-label uppercase tracking-wider font-bold">
                        Objetivo IA ({perspective === 'front' ? 'Frente' : perspective === 'side' ? 'Perfil' : 'Nuca'})
                      </span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-surface p-5 rounded-xl border border-outline-variant/20">
                  <div>
                    <span className="text-xs font-label uppercase tracking-wider text-primary font-bold block mb-1">
                      1. Máquina y Degradado
                    </span>
                    <p className="text-sm text-on-surface leading-relaxed tabular-nums">
                      {activeRecipe.clipperGuard}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-label uppercase tracking-wider text-primary font-bold block mb-1">
                      2. Tijera y Zona Superior
                    </span>
                    <p className="text-sm text-on-surface leading-relaxed tabular-nums">
                      {activeRecipe.scissorWork}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-label uppercase tracking-wider text-primary font-bold block mb-1">
                      3. Contornos y Navaja
                    </span>
                    <p className="text-sm text-on-surface leading-relaxed">
                      {activeRecipe.contours}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-label uppercase tracking-wider text-primary font-bold block mb-1">
                      4. Notas y Visagismo
                    </span>
                    <p className="text-sm text-on-surface leading-relaxed">
                      {customInstructions || analysis?.barberTechnicalTip || 'Respetar caída natural y remolinos en coronilla.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-outline-variant/20 bg-surface flex flex-wrap items-center justify-between gap-3">
                {image && (
                  <button
                    onClick={handleDownloadLook}
                    className="bg-surface-container-high hover:bg-primary/20 text-on-surface border border-outline-variant/30 px-5 py-3 rounded-xl font-label uppercase text-xs tracking-wider font-bold transition-all flex items-center gap-2"
                  >
                    <Download size={15} />
                    <span>Guardar Imagen en el Móvil</span>
                  </button>
                )}
                <button
                  data-custom-booking
                  onClick={() => {
                    setShowBarberCardModal(false);
                    onBookStyle(currentStyleForRecipe);
                  }}
                  className="bg-primary text-on-primary px-8 py-3 rounded-xl font-label uppercase text-xs tracking-widest font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2 ml-auto"
                >
                  <Scissors size={15} />
                  <span>Reservar este Corte</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
