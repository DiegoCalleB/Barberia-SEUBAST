import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, Sparkles, RefreshCw, ChevronRight, Info, CheckCircle2, Scissors, User, Clock, Euro, Loader2, ExternalLink, Bookmark, Trash2, Heart } from 'lucide-react';
import { analyzeFace, generateTryOn, StylistAnalysis } from '../services/geminiService';
import { HAIRCUT_STYLES, BEARD_STYLES } from '../constants';
import { useAuth } from '../lib/useAuth';
import { db, OperationType, handleFirestoreError, auth } from '../lib/firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

function compressBase64Image(base64Str: string, maxWidth: number = 400, quality: number = 0.7): Promise<string> {
  return new Promise((resolve) => {
    if (!base64Str || !base64Str.startsWith('data:image/')) {
      resolve(base64Str);
      return;
    }
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(base64Str);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      } catch (e) {
        console.error("Compression error:", e);
        resolve(base64Str);
      }
    };
    img.onerror = () => {
      resolve(base64Str);
    };
    img.src = base64Str;
  });
}

export function AIStylist({ onBookStyle }: { onBookStyle: (id: string) => void }) {
  const [category, setCategory] = useState<'hair' | 'beard' | 'both'>('both');
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<StylistAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<'camera' | 'upload'>('camera');
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
  const [showInfo, setShowInfo] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  
  // Custom selection state
  const [selectedHairId, setSelectedHairId] = useState<string>(HAIRCUT_STYLES[0].id);
  const [selectedBeardId, setSelectedBeardId] = useState<string>(BEARD_STYLES[0].id);
  const [customInstructions, setCustomInstructions] = useState<string>('');

  // Auth & Saved Looks States
  const { user } = useAuth();
  const [savedLooks, setSavedLooks] = useState<any[]>([]);
  const [isSavingLook, setIsSavingLook] = useState(false);
  const [isLoadingSaved, setIsLoadingSaved] = useState(false);
  const [showSavedTab, setShowSavedTab] = useState(false);
  const [compareLookId, setCompareLookId] = useState<string | null>(null);

  // Helper to fetch saved looks
  const fetchSavedLooks = async () => {
    if (!user) return;
    setIsLoadingSaved(true);
    try {
      const q = query(collection(db, 'saved_looks'), where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const looks = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedLooks(looks);
    } catch (err) {
      console.error("Error fetching saved looks:", err);
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

  const handleSaveLook = async () => {
    if (!user) {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
      } catch (error) {
        console.error('Login failed', error);
      }
      return;
    }
    if (!selectedOverlay || !image) return;
    
    let currentGeneratedImage = '';
    if (perspective === 'side') currentGeneratedImage = generatedLooksSide[selectedOverlay];
    else if (perspective === 'back') currentGeneratedImage = generatedLooksBack[selectedOverlay];
    else currentGeneratedImage = generatedLooks[selectedOverlay];

    if (!currentGeneratedImage) return;

    // Check if already saved
    const alreadySaved = savedLooks.find(l => l.styleId === selectedOverlay && l.perspective === perspective);
    if (alreadySaved) {
      // Toggle off / Delete it
      await handleDeleteLook(alreadySaved.id);
      return;
    }

    setIsSavingLook(true);
    try {
      // Compress both original and generated images to stay well below Firestore 1MB limits
      const [compressedOriginal, compressedGenerated] = await Promise.all([
        compressBase64Image(image, 400, 0.7),
        compressBase64Image(currentGeneratedImage, 400, 0.7)
      ]);

      const payload = {
        uid: user.uid,
        styleId: selectedOverlay,
        styleName: getStyleName(selectedOverlay),
        category: category,
        originalImage: compressedOriginal,
        generatedImage: compressedGenerated,
        perspective: perspective,
        createdAt: new Date()
      };
      
      const docRef = await addDoc(collection(db, 'saved_looks'), {
        ...payload,
        createdAt: serverTimestamp()
      });
      
      setSavedLooks(prev => [...prev, { id: docRef.id, ...payload }]);
    } catch (err) {
      console.error("Error saving look:", err);
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
      console.error("Error deleting look:", err);
      handleFirestoreError(err, OperationType.DELETE, 'saved_looks');
    }
  };
  
  // Helper to get current estimates
  const getEstimates = () => {
    let totalPrice = 0;
    let totalDuration = 0;

    if (category === 'hair' || category === 'both') {
      const hair = HAIRCUT_STYLES.find(s => s.id === selectedHairId);
      if (hair) {
        totalPrice += (hair as any).price || 0;
        totalDuration += hair.duration || 0;
      }
    }

    if (category === 'beard' || category === 'both') {
      const beard = BEARD_STYLES.find(s => s.id === selectedBeardId);
      if (beard) {
        totalPrice += (beard as any).price || 0;
        totalDuration += beard.duration || 0;
      }
    }

    // Apply bundle discount for 'both'
    if (category === 'both') {
      totalPrice = totalPrice * 0.85; // 15% discount for combo
      totalDuration = Math.max(totalDuration - 10, 30); // Save 10 mins in transitions
    }

    return { price: Math.round(totalPrice).toFixed(2).replace(/\.00$/, ''), duration: totalDuration };
  };

  const estimates = getEstimates();

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    setCameraError(null);
    try {
      // Simplificado a {video: true} para máxima compatibilidad
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.message.includes('Permission denied')) {
          setCameraError('Permiso denegado. Abriendo modo de subida manual...');
          setActiveTab('upload');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setCameraError('No se encontró ninguna cámara disponible en este dispositivo.');
          setActiveTab('upload');
        } else {
          setCameraError('Error al acceder a la cámara. Por favor, intenta subir una foto manualmente.');
          setActiveTab('upload');
        }
      } else {
         setActiveTab('upload');
      }
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  useEffect(() => {
    if (activeTab === 'camera' && !image) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [activeTab, image]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);
        const dataUrl = canvasRef.current.toDataURL('image/jpeg');
        setImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeFace(image, category);
      setAnalysis(result);
      
      // Auto-select and auto-generate the top recommendation
      if (result.recommendations && result.recommendations.length > 0) {
        const topRec = result.recommendations[0];
        if (category === 'both') {
          const [hairId, beardId] = topRec.styleId.split('+');
          setSelectedHairId(hairId);
          setSelectedBeardId(beardId);
        } else if (category === 'hair') {
          setSelectedHairId(topRec.styleId);
        } else if (category === 'beard') {
          setSelectedBeardId(topRec.styleId);
        }
        
        // Trigger try-on automatically for the top recommendation
        handleTryOn(topRec.styleId);
      }
    } catch (err) {
      console.error("Analysis failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setAnalysis(null);
    setShowTryOn(false);
    setSelectedOverlay(null);
    setGeneratedLooks({});
    setGeneratedLooksSide({});
    setGeneratedLooksBack({});
    setIsGeneratingTryOn(false);
    setGeneratingStyleId(null);
    setViewMode('single');
    setPerspective('front');
    if (activeTab === 'camera') startCamera();
  };

  const handleTryOn = async (styleId?: string, overridePerspective?: 'front' | 'side' | 'back') => {
    if (!image || !analysis) return;
    
    const finalStyleId = styleId || (category === 'both' ? `${selectedHairId}+${selectedBeardId}` : (category === 'hair' ? selectedHairId : selectedBeardId));
    const targetPerspective = overridePerspective || perspective;

    let targetLooksDict = generatedLooks;
    if (targetPerspective === 'side') targetLooksDict = generatedLooksSide;
    if (targetPerspective === 'back') targetLooksDict = generatedLooksBack;

    if (targetLooksDict[finalStyleId]) {
      setSelectedOverlay(finalStyleId);
      setViewMode('single');
      setShowTryOn(true);
      if (overridePerspective) setPerspective(overridePerspective);
      return;
    }

    let styleName = "";
    let styleInstruction = "";
    if (category === 'both') {
      const [hairId, beardId] = finalStyleId.split('+');
      const hairStyle = HAIRCUT_STYLES.find(s => s.id === hairId);
      const beardStyle = BEARD_STYLES.find(s => s.id === beardId);
      styleName = `${hairStyle?.name || hairId} & ${beardStyle?.name || beardId}`;
      styleInstruction = `${hairStyle?.aiPrompt || ''} \n ${beardStyle?.aiPrompt || ''}`.trim();
    } else {
      const currentStyles = category === 'hair' ? HAIRCUT_STYLES : BEARD_STYLES;
      const style = currentStyles.find(s => s.id === finalStyleId);
      if (!style) return;
      styleName = style.name;
      styleInstruction = (style as any).aiPrompt || '';
    }

    setGeneratingStyleId(finalStyleId);
    setIsGeneratingTryOn(true);
    setGenerationError(null);
    setShowTryOn(true);
    if (overridePerspective) setPerspective(overridePerspective);
    
    try {
      const result = await generateTryOn(image, styleName, category, customInstructions, styleInstruction, targetPerspective);
      
      if (targetPerspective === 'side') {
        setGeneratedLooksSide(prev => ({ ...prev, [finalStyleId]: result }));
      } else if (targetPerspective === 'back') {
        setGeneratedLooksBack(prev => ({ ...prev, [finalStyleId]: result }));
      } else {
        setGeneratedLooks(prev => ({ ...prev, [finalStyleId]: result }));
      }
      
      setSelectedOverlay(finalStyleId);
      setViewMode('single');
    } catch (err: any) {
      console.error("Try-on generation failed:", err);
      setGenerationError(err.message || "Error al generar la imagen. Inténtalo de nuevo.");
    } finally {
      setIsGeneratingTryOn(false);
      setGeneratingStyleId(null);
    }
  };

  const generateAllLooks = async () => {
    if (!image || !analysis) return;
    setIsGeneratingTryOn(true);
    setViewMode('gallery');
    
    for (const rec of analysis.recommendations) {
      if (generatedLooks[rec.styleId]) continue;
      
      let styleName = "";
      if (category === 'both') {
        const [hairId, beardId] = rec.styleId.split('+');
        const hairStyle = HAIRCUT_STYLES.find(s => s.id === hairId);
        const beardStyle = BEARD_STYLES.find(s => s.id === beardId);
        styleName = `${hairStyle?.name || hairId} & ${beardStyle?.name || beardId}`;
      } else {
        const currentStyles = category === 'hair' ? HAIRCUT_STYLES : BEARD_STYLES;
        const style = currentStyles.find(s => s.id === rec.styleId);
        if (!style) continue;
        styleName = style.name;
      }

      setGeneratingStyleId(rec.styleId);
      try {
        const result = await generateTryOn(image, styleName, category, customInstructions);
        setGeneratedLooks(prev => ({ ...prev, [rec.styleId]: result }));
      } catch (err) {
        console.error(`Failed to generate look for ${styleName}:`, err);
      }
    }
    
    setIsGeneratingTryOn(false);
    setGeneratingStyleId(null);
  };

  return (
    <section id="ai-stylist" className="py-24 bg-surface relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
          >
            <Sparkles size={16} className="text-primary" />
            <span className="font-label uppercase tracking-widest text-[10px] text-primary font-bold">Espejo Virtual AI</span>
          </motion.div>
          
          <h2 className="serif-display text-4xl md:text-7xl text-on-surface mb-6">
            Espejo Virtual <span className="italic text-primary">IA</span>
          </h2>
          <p className="font-body text-on-surface-variant text-lg max-w-2xl mx-auto leading-relaxed mb-12">
            Descubre tu mejor versión. Nuestra IA analiza tus facciones y te permite probarte cualquier estilo al instante.
          </p>

          {/* Main Navigation Tabs */}
          <div className="flex bg-surface-container-high p-1.5 rounded-full max-w-md mx-auto mb-10 border border-outline-variant/10">
            <button
              onClick={() => setShowSavedTab(false)}
              className={`flex-1 py-3 rounded-full text-xs font-label uppercase tracking-widest font-bold transition-all ${!showSavedTab ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              Espejo Virtual
            </button>
            <button
              onClick={() => setShowSavedTab(true)}
              className={`flex-1 py-3 rounded-full text-xs font-label uppercase tracking-widest font-bold transition-all flex items-center justify-center gap-2 ${showSavedTab ? 'bg-primary text-on-primary shadow-lg' : 'text-on-surface-variant hover:text-on-surface'}`}
            >
              <Heart size={14} className={savedLooks.length > 0 ? "fill-red-500 text-red-500" : ""} />
              Looks Guardados ({savedLooks.length})
            </button>
          </div>

          {/* Category Switcher */}
          {!showSavedTab && (
            <div className="flex flex-col gap-4 max-w-md mx-auto mb-12">
              <button
                onClick={() => {
                  setCategory('both');
                  reset();
                }}
                className={`w-full px-8 py-4 rounded-full font-label uppercase text-xs tracking-[0.2em] font-bold transition-all duration-300 border flex items-center justify-center gap-3 ${category === 'both' ? 'bg-primary text-on-primary border-primary shadow-xl scale-[1.02]' : 'bg-surface-container-high text-on-surface-variant border-outline-variant/20 hover:border-primary/50'}`}
              >
                <Scissors size={16} />
                Pelo + Barba (Recomendado)
              </button>
              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setCategory('hair');
                    reset();
                  }}
                  className={`flex-1 px-6 py-3 rounded-full font-label uppercase text-[10px] tracking-[0.2em] font-bold transition-all duration-300 border ${category === 'hair' ? 'bg-primary text-on-primary border-primary shadow-lg' : 'bg-surface-container-high text-on-surface-variant border-outline-variant/20 hover:border-primary/50'}`}
                >
                  Corte de Pelo
                </button>
                <button
                  onClick={() => {
                    setCategory('beard');
                    reset();
                  }}
                  className={`flex-1 px-6 py-3 rounded-full font-label uppercase text-[10px] tracking-[0.2em] font-bold transition-all duration-300 border ${category === 'beard' ? 'bg-primary text-on-primary border-primary shadow-lg' : 'bg-surface-container-high text-on-surface-variant border-outline-variant/20 hover:border-primary/50'}`}
                >
                  Arreglo de Barba
                </button>
              </div>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {!showSavedTab ? (
            <motion.div
              key="mirror-grid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
            >
          {/* Left: Interactive Area */}
          <div className="lg:col-span-7">
            {/* Espejo más ancho y tradicional: quitamos el ratio 4/5 estricto para darle más altura y presencia */}
            <div className="relative min-h-[600px] md:min-h-[700px] bg-surface-container-high rounded-3xl border border-outline-variant/20 overflow-hidden shadow-2xl">
              <AnimatePresence mode="wait">
                {!image ? (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0"
                  >
                    {activeTab === 'camera' ? (
                      <div className="relative w-full h-full">
                        {cameraError ? (
                          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-12 text-center z-10">
                            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                              <Camera size={32} className="text-primary/50" />
                            </div>
                            <h3 className="serif-display text-xl text-white mb-3">Acceso Bloqueado</h3>
                            <p className="text-white/60 text-sm mb-8 leading-relaxed">
                              {cameraError}
                            </p>
                            <div className="flex flex-col gap-3 w-full max-w-xs">
                              <a
                                href={window.location.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-white text-black px-8 py-3 rounded-full font-label uppercase text-[10px] tracking-widest font-bold hover:bg-white/90 transition-all shadow-lg flex items-center justify-center gap-2"
                              >
                                <ExternalLink size={14} />
                                Abrir en pestaña nueva
                              </a>
                              <button
                                onClick={() => document.getElementById('native-camera-input')?.click()}
                                className="bg-primary text-on-primary px-8 py-3 rounded-full font-label uppercase text-[10px] tracking-widest font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center justify-center gap-2"
                              >
                                <Camera size={14} />
                                Cámara Nativa
                              </button>
                              <input
                                id="native-camera-input"
                                type="file"
                                accept="image/*"
                                capture="user"
                                className="hidden"
                                onChange={handleFileUpload}
                              />
                              <button
                                onClick={() => setActiveTab('upload')}
                                className="bg-transparent text-white border border-white/30 px-8 py-3 rounded-full font-label uppercase text-[10px] tracking-widest font-bold hover:bg-white/10 transition-all"
                              >
                                Subir foto manualmente
                              </button>
                            </div>
                          </div>
                        ) : (
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover scale-x-[-1]"
                          />
                        )}
                        <div className="absolute inset-0 border-[40px] border-black/40 pointer-events-none">
                          <div className="w-full h-full border-2 border-primary/50 rounded-[40px] relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-2 border-dashed border-white/30 rounded-full" />
                          </div>
                        </div>
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4">
                          <button
                            onClick={capturePhoto}
                            className="w-16 h-16 rounded-full bg-white border-4 border-primary/50 flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                          >
                            <div className="w-12 h-12 rounded-full bg-white border-2 border-black/10" />
                          </button>
                          <span className="text-white text-xs font-label uppercase tracking-widest bg-black/40 backdrop-blur-md px-4 py-2 rounded-full">Capturar Foto</span>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center">
                        <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                          <Upload size={40} className="text-primary" />
                        </div>
                        <h3 className="serif-display text-2xl text-on-surface mb-4">Sube tu Foto</h3>
                        <p className="font-body text-on-surface-variant mb-8">Para mejores resultados, usa una foto frontal con buena iluminación.</p>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-primary text-on-primary px-8 py-4 rounded-full font-label uppercase text-xs tracking-widest font-bold hover:bg-primary/90 transition-all shadow-lg"
                        >
                          Seleccionar Archivo
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileUpload}
                          className="hidden"
                          accept="image/*"
                        />
                      </div>
                    )}
                    
                    {/* Tab Switcher */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 flex bg-black/40 backdrop-blur-md p-1 rounded-full border border-white/10">
                      <button
                        onClick={() => setActiveTab('camera')}
                        className={`px-6 py-2 rounded-full text-[10px] font-label uppercase tracking-widest transition-all ${activeTab === 'camera' ? 'bg-primary text-on-primary' : 'text-white hover:text-primary'}`}
                      >
                        Cámara
                      </button>
                      <button
                        onClick={() => setActiveTab('upload')}
                        className={`px-6 py-2 rounded-full text-[10px] font-label uppercase tracking-widest transition-all ${activeTab === 'upload' ? 'bg-primary text-on-primary' : 'text-white hover:text-primary'}`}
                      >
                        Subir
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col"
                  >
                    {viewMode === 'single' ? (
                      <div className="relative w-full h-full">
                        <img 
                          src={showTryOn && selectedOverlay && !showOriginal ? 
                            (perspective === 'side' ? generatedLooksSide[selectedOverlay] : 
                             perspective === 'back' ? generatedLooksBack[selectedOverlay] : 
                             generatedLooks[selectedOverlay]) || image 
                          : image} 
                          className="w-full h-full object-cover" 
                          alt="Preview" 
                        />
                        
                        {/* Perspective Toggles (Old removed, new Slider at the bottom) */}
                        {showTryOn && selectedOverlay && !isGeneratingTryOn && (
                          <>
                            {/* Visual indicator / Rotation Slider */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[85%] max-w-[320px] bg-black/70 backdrop-blur-xl px-6 py-4 rounded-full border border-white/10 shadow-2xl z-20 flex flex-col items-center gap-3">
                              <div className="flex justify-between w-full text-[9px] text-white/50 uppercase tracking-widest font-label font-bold">
                                <span className={perspective === 'front' ? 'text-primary' : ''}>Frente</span>
                                <span className={perspective === 'side' ? 'text-primary' : ''}>Perfil</span>
                                <span className={perspective === 'back' ? 'text-primary' : ''}>Atrás</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="2"
                                step="1"
                                value={['front', 'side', 'back'].indexOf(perspective)}
                                onChange={(e) => {
                                  const p = ['front', 'side', 'back'][parseInt(e.target.value)] as 'front' | 'side' | 'back';
                                  if (p !== perspective) {
                                    handleTryOn(selectedOverlay, p);
                                  }
                                }}
                                className="w-full appearance-none h-1.5 bg-white/10 rounded-full outline-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full cursor-pointer"
                              />
                            </div>
                            
                            {/* Drag Gestures Overlay */}
                            <div 
                              className="absolute inset-0 z-10 cursor-grab active:cursor-grabbing"
                              onPointerDown={(e) => setDragStartX(e.clientX)}
                              onPointerUp={(e) => {
                                if (dragStartX !== null) {
                                  const diffX = e.clientX - dragStartX;
                                  const pList: ('front' | 'side' | 'back')[] = ['front', 'side', 'back'];
                                  const idx = pList.indexOf(perspective);
                                  
                                  if (diffX < -50 && idx < 2) {
                                    handleTryOn(selectedOverlay, pList[idx + 1]); // Swipe left -> next perspective (rotate right)
                                  } else if (diffX > 50 && idx > 0) {
                                    handleTryOn(selectedOverlay, pList[idx - 1]); // Swipe right -> prev perspective (rotate left)
                                  }
                                  setDragStartX(null);
                                }
                              }}
                              onPointerLeave={() => setDragStartX(null)}
                            />
                            <div className="absolute top-1/2 left-4 -translate-y-1/2 bg-black/40 text-white/70 p-2 rounded-full pointer-events-none opacity-0 md:opacity-100 transition-opacity">
                              <ChevronRight className="rotate-180" size={24} />
                            </div>
                            <div className="absolute top-1/2 right-4 -translate-y-1/2 bg-black/40 text-white/70 p-2 rounded-full pointer-events-none opacity-0 md:opacity-100 transition-opacity">
                              <ChevronRight size={24} />
                            </div>
                          </>
                        )}

                        {/* Save Look Toggle */}
                        {showTryOn && selectedOverlay && !isGeneratingTryOn && (
                          <button
                            onClick={handleSaveLook}
                            disabled={isSavingLook}
                            className="absolute top-6 left-6 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] font-label uppercase tracking-widest border border-white/20 hover:bg-primary hover:text-on-primary transition-all z-30 shadow-lg flex items-center gap-2 disabled:opacity-50"
                          >
                            {isSavingLook ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <Heart size={12} className={savedLooks.some(l => l.styleId === selectedOverlay && l.perspective === perspective) ? "fill-red-500 text-red-500" : ""} />
                            )}
                            {savedLooks.some(l => l.styleId === selectedOverlay && l.perspective === perspective) ? 'Guardado' : 'Guardar Look'}
                          </button>
                        )}

                        {/* Comparison Toggle */}
                        {showTryOn && selectedOverlay && !isGeneratingTryOn && (
                          <button
                            onPointerDown={() => setShowOriginal(true)}
                            onPointerUp={() => setShowOriginal(false)}
                            onPointerLeave={() => setShowOriginal(false)}
                            className="absolute top-6 right-6 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] font-label uppercase tracking-widest border border-white/20 hover:bg-primary hover:text-on-primary transition-all z-30 shadow-lg"
                          >
                            {showOriginal ? 'Viendo Original' : 'Mantén para Comparar'}
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full p-4 overflow-y-auto bg-surface-container-low">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-outline-variant/20 shadow-lg">
                            <img src={image} className="w-full h-full object-cover" alt="Original" />
                            <div className="absolute bottom-0 left-0 w-full bg-black/60 backdrop-blur-sm p-2 text-center">
                              <span className="text-[10px] text-white font-label uppercase tracking-widest">Original</span>
                            </div>
                          </div>
                          {analysis?.recommendations.map(rec => {
                            let styleName = "";
                            let styleImage = "";
                            
                            if (category === 'both') {
                              const [hairId, beardId] = rec.styleId.split('+');
                              const hairStyle = HAIRCUT_STYLES.find(s => s.id === hairId);
                              const beardStyle = BEARD_STYLES.find(s => s.id === beardId);
                              styleName = `${hairStyle?.name || hairId} & ${beardStyle?.name || beardId}`;
                              styleImage = hairStyle?.image || "";
                            } else {
                              const currentStyles = category === 'hair' ? HAIRCUT_STYLES : BEARD_STYLES;
                              const style = currentStyles.find(s => s.id === rec.styleId);
                              styleName = style?.name || "";
                              styleImage = style?.image || "";
                            }

                            const generatedImg = generatedLooks[rec.styleId];
                            const isGeneratingThis = generatingStyleId === rec.styleId;

                            return (
                              <div 
                                key={rec.styleId}
                                onClick={() => {
                                  if (generatedImg) {
                                    setSelectedOverlay(rec.styleId);
                                    setViewMode('single');
                                  }
                                }}
                                className={`relative aspect-[4/5] rounded-2xl overflow-hidden border transition-all cursor-pointer ${selectedOverlay === rec.styleId ? 'border-primary ring-2 ring-primary/20' : 'border-outline-variant/20 hover:border-primary/50'}`}
                              >
                                {generatedImg ? (
                                  <img src={generatedImg} className="w-full h-full object-cover" alt={styleName} />
                                ) : (
                                  <div className="w-full h-full bg-black/20 flex flex-col items-center justify-center p-4 text-center">
                                    {isGeneratingThis ? (
                                      <Loader2 size={24} className="text-primary animate-spin mb-2" />
                                    ) : (
                                      <Scissors size={24} className="text-white/40 mb-2" />
                                    )}
                                    <span className="text-[10px] text-white/60 font-label uppercase tracking-widest">
                                      {isGeneratingThis ? 'Generando...' : styleName}
                                    </span>
                                  </div>
                                )}
                                <div className="absolute bottom-0 left-0 w-full bg-black/60 backdrop-blur-sm p-2 text-center">
                                  <span className="text-[10px] text-white font-label uppercase tracking-widest">{styleName}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Analysis Overlay */}
                    {(isAnalyzing || (isGeneratingTryOn && viewMode === 'single')) && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 z-30">
                        <Loader2 size={48} className="text-primary animate-spin mb-6" />
                        <h3 className="serif-display text-2xl text-white mb-2">
                          {isAnalyzing ? 'Analizando Facciones...' : 'Generando Look con IA...'}
                        </h3>
                        <p className="text-white/60 text-sm">
                          {isAnalyzing 
                            ? 'Nuestra IA está determinando tu estructura facial para darte el mejor consejo.'
                            : `Estamos aplicando el ${category === 'hair' ? 'corte de pelo' : (category === 'beard' ? 'estilo de barba' : 'look completo')} a tu foto de forma realista. Esto puede tardar unos segundos.`}
                        </p>
                      </div>
                    )}

                    {/* Error Display */}
                    {generationError && !isGeneratingTryOn && (
                      <div className="absolute inset-x-8 bottom-24 bg-red-600/90 backdrop-blur-md p-4 rounded-2xl border border-white/10 z-40 flex flex-col items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full">
                          <Info size={16} className="text-white" />
                        </div>
                        <p className="text-white text-xs text-center font-medium leading-relaxed">{generationError}</p>
                        <button 
                          onClick={() => setGenerationError(null)}
                          className="px-6 py-2 bg-white text-red-600 rounded-full text-[10px] font-label uppercase tracking-widest font-bold transition-all hover:scale-105 active:scale-95"
                        >
                          Entendido
                        </button>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="absolute bottom-8 left-0 w-full px-8 flex justify-between items-center">
                      <button
                        onClick={reset}
                        className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:text-on-primary transition-all"
                      >
                        <RefreshCw size={20} />
                      </button>
                      
                      {!analysis ? (
                        <button
                          onClick={handleAnalyze}
                          disabled={isAnalyzing}
                          className="bg-primary text-on-primary px-8 py-4 rounded-full font-label uppercase text-xs tracking-widest font-bold hover:bg-primary/90 transition-all shadow-xl flex items-center gap-2"
                        >
                          <Sparkles size={18} /> Analizar con IA
                        </button>
                      ) : (
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setShowTryOn(!showTryOn);
                              if (!showTryOn) setViewMode('single');
                            }}
                            className={`px-8 py-4 rounded-full font-label uppercase text-xs tracking-widest font-bold transition-all shadow-xl flex items-center gap-2 ${showTryOn ? 'bg-white text-black' : 'bg-primary text-on-primary'}`}
                          >
                            <Scissors size={18} /> 
                            {!showTryOn ? 'Probar Estilos' : 'Ver Original'}
                          </button>
                          {showTryOn && Object.keys(generatedLooks).length > 1 && (
                            <button
                              onClick={() => setViewMode(viewMode === 'single' ? 'gallery' : 'single')}
                              className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-primary hover:text-on-primary transition-all"
                            >
                              <User size={20} />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Right: Analysis & Recommendations */}
          <div className="lg:col-span-5 space-y-8">
            <AnimatePresence mode="wait">
              {!analysis ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-surface-container-low p-8 rounded-3xl border border-outline-variant/10 relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Sparkles size={24} className="text-primary" />
                    </div>
                    <button 
                      onClick={() => setShowInfo(!showInfo)}
                      className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:bg-primary/20 hover:text-primary transition-all"
                      title="¿Cómo funciona?"
                    >
                      <Info size={16} />
                    </button>
                  </div>

                  <h3 className="serif-display text-2xl text-on-surface mb-2">Tu Mejor Versión</h3>
                  <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
                    Sube una foto para que nuestra IA analice tus facciones y te recomiende el look perfecto.
                  </p>

                  <AnimatePresence>
                    {showInfo && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="pt-4 border-t border-outline-variant/10 space-y-4">
                          {[
                            "Tómate una foto frontal o súbela.",
                            "Analizamos tu cara y tipo de pelo.",
                            "Recibes recomendaciones expertas.",
                            "Pruébatelas antes de reservar."
                          ].map((text, i) => (
                            <div key={i} className="flex gap-3 items-center text-on-surface-variant text-xs">
                              <span className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[8px] font-bold shrink-0">{i+1}</span>
                              {text}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!showInfo && (
                    <div className="flex items-center gap-2 text-[10px] font-label uppercase tracking-widest text-primary/60">
                      <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                      Esperando tu imagen...
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="analysis"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Face Analysis Card */}
                  <div className="bg-surface-container-high p-6 rounded-3xl border border-outline-variant/10 shadow-lg">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User size={20} className="text-primary" />
                      </div>
                      <div>
                        <h3 className="serif-display text-lg text-on-surface">Perfil de Estilo</h3>
                        <p className="text-[10px] font-label uppercase tracking-widest text-primary">Análisis IA Completado</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-surface p-3 rounded-xl border border-outline-variant/10">
                        <span className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant block mb-1">Cara</span>
                        <span className="text-xs font-bold text-on-surface capitalize block break-words leading-snug">{analysis.faceShape}</span>
                      </div>
                      <div className="bg-surface p-3 rounded-xl border border-outline-variant/10">
                        <span className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant block mb-1">Tipo</span>
                        <span className="text-xs font-bold text-on-surface capitalize block break-words leading-snug">
                          {category === 'both' ? 'Mixto' : analysis.hairType}
                        </span>
                      </div>
                      {analysis.hairThickness && (
                        <div className="bg-surface p-3 rounded-xl border border-outline-variant/10">
                          <span className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant block mb-1">Grosor</span>
                          <span className="text-xs font-bold text-on-surface capitalize block break-words leading-snug">{analysis.hairThickness}</span>
                        </div>
                      )}
                      {analysis.stylingProduct && (
                        <div className={`bg-surface p-3 rounded-xl border border-outline-variant/10 ${analysis.hairThickness ? 'col-span-1' : 'col-span-2'} md:col-span-2`}>
                          <span className="text-[9px] font-label uppercase tracking-widest text-on-surface-variant block mb-1">Fijación</span>
                          <span className="text-xs font-bold text-on-surface capitalize block break-words leading-snug">{analysis.stylingProduct}</span>
                        </div>
                      )}
                    </div>

                    {/* Pro Advice Highlight */}
                    <div className="p-4 bg-primary/10 rounded-xl border border-primary/20 mb-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-2 opacity-10">
                        <Sparkles size={32} className="text-primary" />
                      </div>
                      <h4 className="font-label uppercase tracking-[0.2em] text-[9px] text-primary font-bold mb-2 flex items-center gap-2">
                        <Scissors size={12} /> Recomendación del Barbero Pro
                      </h4>
                      <p className="font-body text-xs text-on-surface leading-relaxed italic">
                        "{analysis.advice}"
                      </p>
                    </div>

                    {/* Custom Selection Dropdowns */}
                    <div className="space-y-4 pt-4 border-t border-outline-variant/10">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-label uppercase tracking-widest text-[10px] text-on-surface-variant font-bold">Personalizar mi Look</h3>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-primary">
                            <Clock size={12} />
                            <span className="text-[10px] font-bold">{estimates.duration} min</span>
                          </div>
                          <div className="flex items-center gap-1 text-primary">
                            <Euro size={12} />
                            <span className="text-[10px] font-bold">{estimates.price}€</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {(category === 'hair' || category === 'both') && (
                          <div>
                            <label className="text-[9px] font-label uppercase text-on-surface-variant mb-1.5 block">Corte de Pelo</label>
                            <select 
                              value={selectedHairId}
                              onChange={(e) => setSelectedHairId(e.target.value)}
                              className="w-full bg-surface border border-outline-variant/20 rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all cursor-pointer"
                            >
                              {HAIRCUT_STYLES.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        {(category === 'beard' || category === 'both') && (
                          <div>
                            <label className="text-[9px] font-label uppercase text-on-surface-variant mb-1.5 block">Estilo de Barba</label>
                            <select 
                              value={selectedBeardId}
                              onChange={(e) => setSelectedBeardId(e.target.value)}
                              className="w-full bg-surface border border-outline-variant/20 rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all cursor-pointer"
                            >
                              {BEARD_STYLES.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>
                          </div>
                        )}
                        <div>
                          <label className="text-[9px] font-label uppercase text-on-surface-variant mb-1.5 block">Instrucciones Especiales</label>
                          <textarea
                            value={customInstructions}
                            onChange={(e) => setCustomInstructions(e.target.value)}
                            placeholder="Ej: Quiero la cresta más corta, ponme un pendiente, barba más arreglada..."
                            className="w-full bg-surface border border-outline-variant/20 rounded-lg px-3 py-2 text-xs text-on-surface focus:border-primary outline-none transition-all resize-none h-16"
                          />
                        </div>
                        <button
                          onClick={() => handleTryOn()}
                          disabled={isGeneratingTryOn}
                          className="w-full bg-primary text-on-primary py-3 rounded-lg font-label uppercase text-[10px] tracking-widest font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                        >
                          {isGeneratingTryOn ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                          {isGeneratingTryOn ? 'Generando...' : 'Aplicar este Look'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Recommendations List */}
                  <div className="bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10">
                    <h3 className="font-label uppercase tracking-widest text-[10px] text-primary mb-4 flex items-center gap-2 font-bold">
                      <CheckCircle2 size={14} /> Otras Opciones
                    </h3>
                    <div className="space-y-3">
                      {analysis.recommendations.map((rec, i) => {
                        let styleName = "";
                        let styleImage = "";
                        
                        if (category === 'both') {
                          const [hairId, beardId] = rec.styleId.split('+');
                          const hairStyle = HAIRCUT_STYLES.find(s => s.id === hairId);
                          const beardStyle = BEARD_STYLES.find(s => s.id === beardId);
                          styleName = `${hairStyle?.name || hairId} & ${beardStyle?.name || beardId}`;
                          styleImage = hairStyle?.image || "";
                        } else {
                          const currentStyles = category === 'hair' ? HAIRCUT_STYLES : BEARD_STYLES;
                          const style = currentStyles.find(s => s.id === rec.styleId);
                          styleName = style?.name || "";
                          styleImage = style?.image || "";
                        }

                        return (
                          <div
                            key={rec.styleId}
                            onClick={() => handleTryOn(rec.styleId)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer group flex items-center gap-3 ${selectedOverlay === rec.styleId ? 'border-primary bg-primary/5' : 'border-outline-variant/10 bg-surface hover:border-primary/30'}`}
                          >
                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0">
                              <img src={styleImage} alt={styleName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            </div>
                            <div className="flex-grow min-w-0">
                              <h4 className="font-headline text-xs text-on-surface truncate">{styleName}</h4>
                              <p className="text-[9px] text-on-surface-variant truncate">Sugerido por IA</p>
                            </div>
                            <ChevronRight size={12} className="text-on-surface-variant group-hover:text-primary transition-colors shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    data-custom-booking
                     onClick={() => {
                       if (selectedOverlay) {
                         onBookStyle(selectedOverlay);
                       } else {
                         let styleToBook = category === 'both' ? `${selectedHairId}+${selectedBeardId}` : (category === 'hair' ? selectedHairId : selectedBeardId);
                         onBookStyle(styleToBook);
                       }
                     }}
                    className="w-full bg-gradient-to-r from-primary to-primary-container text-on-primary py-4 rounded-xl font-label uppercase text-xs tracking-widest font-bold hover:scale-[1.02] transition-all shadow-xl"
                  >
                    Reservar este Estilo
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="saved-looks-grid"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-surface-container-high p-8 md:p-12 rounded-3xl border border-outline-variant/20 shadow-2xl"
        >
          {!user ? (
            <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto py-12">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
                <Bookmark size={28} className="text-primary" />
              </div>
              <h3 className="serif-display text-2xl text-on-surface mb-3">Guarda tus Looks Favoritos</h3>
              <p className="text-on-surface-variant text-sm mb-8 leading-relaxed">
                Inicia sesión de forma segura para poder guardar tus simulaciones de peinados y barbas generadas por IA. Podrás acceder a ellas desde cualquier dispositivo y mostrárselas directamente a tu barbero.
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
                className="bg-primary text-on-primary px-8 py-4 rounded-full font-label uppercase text-xs tracking-widest font-bold hover:bg-primary/90 transition-all shadow-lg flex items-center gap-2"
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
                Aún no has guardado ningún look. Sube tu foto al Espejo Virtual, pruébate diferentes estilos y pulsa "Guardar" para coleccionarlos aquí.
              </p>
              <button
                onClick={() => setShowSavedTab(false)}
                className="bg-primary text-on-primary px-8 py-4 rounded-full font-label uppercase text-xs tracking-widest font-bold hover:bg-primary/90 transition-all shadow-lg"
              >
                Probar el Espejo Virtual
              </button>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-outline-variant/10">
                <div>
                  <h3 className="serif-display text-2xl text-on-surface">Mis Looks Guardados</h3>
                  <p className="text-on-surface-variant text-xs mt-1">Aquí tienes guardadas todas las simulaciones de tu imagen con IA.</p>
                </div>
                <span className="text-xs font-label uppercase tracking-widest bg-primary/15 text-primary px-3 py-1.5 rounded-full font-bold">
                  {savedLooks.length} {savedLooks.length === 1 ? 'Look' : 'Looks'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {savedLooks.map((look) => (
                  <div 
                    key={look.id}
                    className="bg-surface border border-outline-variant/10 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col group relative"
                  >
                    {/* Image Viewer */}
                    <div className="relative aspect-[4/5] bg-black overflow-hidden">
                      <img 
                        src={compareLookId === look.id ? look.originalImage : look.generatedImage} 
                        alt={look.styleName} 
                        className="w-full h-full object-cover transition-all duration-500"
                        referrerPolicy="no-referrer"
                      />
                      
                      {/* Floating Badge (Perspective) */}
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-[9px] font-label uppercase tracking-widest border border-white/10">
                        {look.perspective === 'front' ? 'Frente' : look.perspective === 'side' ? 'Perfil' : 'Atrás'}
                      </div>

                      {/* Action Button: Delete */}
                      <button
                        onClick={() => handleDeleteLook(look.id)}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white hover:text-red-500 hover:bg-black/80 flex items-center justify-center border border-white/10 transition-all z-20"
                        title="Eliminar Look"
                      >
                        <Trash2 size={14} />
                      </button>

                      {/* Hold/Click to Compare */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
                        <button
                          onPointerDown={() => setCompareLookId(look.id)}
                          onPointerUp={() => setCompareLookId(null)}
                          onPointerLeave={() => setCompareLookId(null)}
                          className="bg-black/80 backdrop-blur-md text-white text-[10px] font-label uppercase tracking-widest px-4 py-2.5 rounded-full border border-white/20 hover:bg-primary transition-all shadow-xl"
                        >
                          Mantener para ver original
                        </button>
                      </div>
                    </div>

                    {/* Card Details */}
                    <div className="p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="serif-display text-lg text-on-surface mb-1">{look.styleName}</h4>
                        <p className="text-on-surface-variant text-[10px] font-label uppercase tracking-widest mb-4 flex items-center gap-1">
                          <Sparkles size={10} className="text-primary" /> Categoría: {look.category === 'both' ? 'Pelo + Barba' : look.category === 'hair' ? 'Corte de Pelo' : 'Arreglo de Barba'}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => onBookStyle(look.styleId)}
                        className="w-full bg-primary text-on-primary py-3 rounded-xl font-label uppercase text-[10px] tracking-widest font-bold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <Scissors size={12} />
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
    </section>
  );
}
