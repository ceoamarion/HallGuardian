// ─── QR Scanner Screen ────────────────────────────────────────────────────────
import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Vibration,
    TextInput,
    Modal,
    ScrollView,
    ActivityIndicator,
    Animated,
} from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { StatusBar } from "expo-status-bar";
import * as Haptics from "expo-haptics";
import { useAuth } from "../AuthContext";
import { apiScanQR, ScanResult } from "../api";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function elapsed(isoString: string): string {
    const secs = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (secs < 60) return `${secs}s ago`;
    if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
    return `${Math.floor(secs / 3600)}h ${Math.floor((secs % 3600) / 60)}m ago`;
}

function directionColor(dir: "IN" | "OUT") {
    return dir === "OUT" ? "#f97316" : "#22c55e";
}

// ─── Recent scan entry ────────────────────────────────────────────────────────
interface RecentScan {
    id: number;
    studentName: string;
    locationName: string;
    direction: "IN" | "OUT";
    scannedAt: string;
    elapsedWhenReturned?: number; // seconds OUT
}

export default function ScannerScreen() {
    const { token, user, signOut } = useAuth();
    const [permission, requestPermission] = useCameraPermissions();
    const [scanning, setScanning] = useState(true);
    const [cooldown, setCooldown] = useState(false);
    const [locationCode, setLocationCode] = useState("CLASSROOM-1");
    const [showSettings, setShowSettings] = useState(false);
    const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
    const [lastResult, setLastResult] = useState<ScanResult | null>(null);
    const [showResult, setShowResult] = useState(false);

    const flashAnim = useRef(new Animated.Value(0)).current;
    const resultAnim = useRef(new Animated.Value(0)).current;

    // Track time-OUT durations: studentId → OUT scanned_at ISO
    const outTimestamps = useRef<Record<number, string>>({});

    useEffect(() => {
        if (!permission?.granted) requestPermission();
    }, []);

    const flashScreen = (color: string) => {
        Animated.sequence([
            Animated.timing(flashAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
            Animated.timing(flashAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        ]).start();
    };

    const showResultCard = () => {
        Animated.spring(resultAnim, {
            toValue: 1,
            tension: 120,
            friction: 8,
            useNativeDriver: true,
        }).start();
        setShowResult(true);
        setTimeout(() => {
            Animated.timing(resultAnim, {
                toValue: 0,
                duration: 350,
                useNativeDriver: true,
            }).start(() => setShowResult(false));
        }, 3500);
    };

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (cooldown || !scanning) return;
        if (!token || !user?.schoolId) return;

        // Prevent double-scans for 2.5 s
        setCooldown(true);
        setTimeout(() => setCooldown(false), 2500);

        try {
            const result = await apiScanQR(
                token,
                data,
                locationCode,
                user.schoolId,
                `Mobile-${user.email}`
            );

            // Haptic + flash
            if (result.direction === "OUT") {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                outTimestamps.current[result.student.id] = result.student
                    ? new Date().toISOString()
                    : "";
            } else {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }
            flashScreen(result.direction === "OUT" ? "#f97316" : "#22c55e");

            // Compute elapsed time if returning (IN) and we have OUT timestamp
            let elapsedSecs: number | undefined;
            if (result.direction === "IN" && outTimestamps.current[result.student.id]) {
                const outAt = new Date(outTimestamps.current[result.student.id]).getTime();
                elapsedSecs = Math.floor((Date.now() - outAt) / 1000);
                delete outTimestamps.current[result.student.id];
            }

            const entry: RecentScan = {
                id: result.eventId,
                studentName: result.student.name,
                locationName: result.location.name,
                direction: result.direction,
                scannedAt: new Date().toISOString(),
                elapsedWhenReturned: elapsedSecs,
            };

            setLastResult(result);
            setRecentScans((prev) => [entry, ...prev].slice(0, 20));
            showResultCard();
        } catch (err: any) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Vibration.vibrate(400);
            Alert.alert("Scan failed", err.message || "Unknown error");
        }
    };

    if (!permission) return <View style={styles.root} />;
    if (!permission.granted) {
        return (
            <View style={styles.permRoot}>
                <Text style={styles.permTitle}>Camera permission needed</Text>
                <Text style={styles.permSub}>
                    HallGuardian needs camera access to scan QR codes.
                </Text>
                <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
                    <Text style={styles.permBtnText}>Grant Permission</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.root}>
            <StatusBar style="light" />

            {/* ── Camera view ── */}
            <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                onBarcodeScanned={cooldown ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            />

            {/* Screen flash overlay */}
            <Animated.View
                pointerEvents="none"
                style={[
                    StyleSheet.absoluteFill,
                    {
                        backgroundColor:
                            lastResult?.direction === "OUT" ? "#f9731660" : "#22c55e60",
                        opacity: flashAnim,
                    },
                ]}
            />

            {/* ── Header ── */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>HallGuardian</Text>
                    <Text style={styles.headerSub}>
                        📍 {locationCode} · {user?.email}
                    </Text>
                </View>
                <View style={styles.headerBtns}>
                    <TouchableOpacity
                        style={styles.iconBtn}
                        onPress={() => setShowSettings(true)}
                    >
                        <Text style={styles.iconBtnText}>⚙️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconBtn} onPress={signOut}>
                        <Text style={styles.iconBtnText}>↪️</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ── Scan frame ── */}
            <View style={styles.framePad}>
                <View style={styles.frame}>
                    <View style={[styles.corner, styles.tl]} />
                    <View style={[styles.corner, styles.tr]} />
                    <View style={[styles.corner, styles.bl]} />
                    <View style={[styles.corner, styles.br]} />
                    {cooldown && (
                        <View style={styles.cooldownBadge}>
                            <ActivityIndicator color="#fff" size="small" />
                            <Text style={styles.cooldownText}>Processing…</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.scanHint}>
                    Point at a student's QR code to check them OUT or IN
                </Text>
            </View>

            {/* ── Result card (pops up after scan) ── */}
            {showResult && lastResult && (
                <Animated.View
                    style={[
                        styles.resultCard,
                        {
                            transform: [
                                {
                                    translateY: resultAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [200, 0],
                                    }),
                                },
                            ],
                            opacity: resultAnim,
                        },
                    ]}
                >
                    <View
                        style={[
                            styles.dirBadge,
                            {
                                backgroundColor:
                                    lastResult.direction === "OUT" ? "#7c2d12" : "#14532d",
                            },
                        ]}
                    >
                        <Text style={styles.dirBadgeText}>
                            {lastResult.direction === "OUT" ? "⬆️ LEAVING" : "⬇️ RETURNING"}
                        </Text>
                    </View>
                    <Text style={styles.resultName}>{lastResult.student.name}</Text>
                    <Text style={styles.resultLoc}>📍 {lastResult.location.name}</Text>
                    {lastResult.direction === "IN" &&
                        recentScans[0]?.elapsedWhenReturned !== undefined && (
                            <Text style={styles.resultDuration}>
                                ⏱ Was out for{" "}
                                {recentScans[0].elapsedWhenReturned! >= 60
                                    ? `${Math.floor(recentScans[0].elapsedWhenReturned! / 60)}m ${recentScans[0].elapsedWhenReturned! % 60}s`
                                    : `${recentScans[0].elapsedWhenReturned}s`}
                            </Text>
                        )}
                </Animated.View>
            )}

            {/* ── Recent scans drawer ── */}
            <View style={styles.drawer}>
                <Text style={styles.drawerTitle}>Recent Scans</Text>
                <ScrollView style={{ maxHeight: 200 }} showsVerticalScrollIndicator={false}>
                    {recentScans.length === 0 ? (
                        <Text style={styles.drawerEmpty}>No scans yet this session.</Text>
                    ) : (
                        recentScans.map((s) => (
                            <View key={s.id} style={styles.scanRow}>
                                <View
                                    style={[
                                        styles.scanDot,
                                        { backgroundColor: directionColor(s.direction) },
                                    ]}
                                />
                                <View style={styles.scanRowText}>
                                    <Text style={styles.scanName}>{s.studentName}</Text>
                                    <Text style={styles.scanLoc}>
                                        {s.locationName} ·{" "}
                                        {s.direction === "OUT" ? "Left" : "Returned"} ·{" "}
                                        {elapsed(s.scannedAt)}
                                        {s.direction === "IN" &&
                                            s.elapsedWhenReturned !== undefined &&
                                            ` (out ${Math.floor(s.elapsedWhenReturned / 60)}m ${s.elapsedWhenReturned % 60}s)`}
                                    </Text>
                                </View>
                                <View
                                    style={[
                                        styles.scanBadge,
                                        { backgroundColor: directionColor(s.direction) + "30" },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.scanBadgeText,
                                            { color: directionColor(s.direction) },
                                        ]}
                                    >
                                        {s.direction}
                                    </Text>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </View>

            {/* ── Settings modal ── */}
            <Modal
                visible={showSettings}
                animationType="slide"
                presentationStyle="formSheet"
                onRequestClose={() => setShowSettings(false)}
            >
                <View style={styles.modalRoot}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Station Settings</Text>
                        <TouchableOpacity onPress={() => setShowSettings(false)}>
                            <Text style={styles.modalClose}>Done</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.modalLabel}>Location Code</Text>
                    <Text style={styles.modalHint}>
                        This identifies which room/area this device is scanning for.
                    </Text>
                    <TextInput
                        style={styles.modalInput}
                        value={locationCode}
                        onChangeText={setLocationCode}
                        autoCapitalize="characters"
                        placeholder="e.g. ROOM-101, LIBRARY, GYM"
                        placeholderTextColor="#94a3b8"
                    />

                    <Text style={styles.modalLabel}>Signed in as</Text>
                    <View style={styles.modalInfo}>
                        <Text style={styles.modalInfoText}>{user?.email}</Text>
                        <Text style={styles.modalInfoRole}>{user?.role}</Text>
                    </View>

                    <TouchableOpacity
                        style={styles.signOutBtn}
                        onPress={() => {
                            setShowSettings(false);
                            signOut();
                        }}
                    >
                        <Text style={styles.signOutText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
}

const CORNER = 28;
const FRAME = 260;

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: "#000" },

    // ── Permission ──
    permRoot: {
        flex: 1,
        backgroundColor: "#0f172a",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
    },
    permTitle: { color: "#f1f5f9", fontSize: 22, fontWeight: "700", marginBottom: 12 },
    permSub: { color: "#64748b", textAlign: "center", marginBottom: 32 },
    permBtn: {
        backgroundColor: "#0369a1",
        paddingHorizontal: 28,
        paddingVertical: 14,
        borderRadius: 12,
    },
    permBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

    // ── Header ──
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 56,
        paddingBottom: 12,
        backgroundColor: "rgba(15,23,42,0.92)",
    },
    headerTitle: { color: "#f8fafc", fontWeight: "800", fontSize: 20, letterSpacing: -0.5 },
    headerSub: { color: "#64748b", fontSize: 12, marginTop: 2 },
    headerBtns: { flexDirection: "row", gap: 8 },
    iconBtn: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.1)",
        alignItems: "center",
        justifyContent: "center",
    },
    iconBtnText: { fontSize: 18 },

    // ── Frame ──
    framePad: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    frame: {
        width: FRAME,
        height: FRAME,
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },
    corner: {
        position: "absolute",
        width: CORNER,
        height: CORNER,
        borderColor: "#0ea5e9",
        borderWidth: 3,
    },
    tl: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 6 },
    tr: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 6 },
    bl: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 6 },
    br: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 6 },
    cooldownBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(0,0,0,0.7)",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 100,
    },
    cooldownText: { color: "#fff", fontSize: 14, fontWeight: "600" },
    scanHint: {
        color: "rgba(255,255,255,0.6)",
        fontSize: 13,
        textAlign: "center",
        marginTop: 24,
        paddingHorizontal: 40,
    },

    // ── Result card ──
    resultCard: {
        position: "absolute",
        left: 16,
        right: 16,
        bottom: 240,
        backgroundColor: "#1e293b",
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: "#334155",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 20,
    },
    dirBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 100,
        marginBottom: 10,
    },
    dirBadgeText: { color: "#fff", fontWeight: "700", fontSize: 12, letterSpacing: 0.5 },
    resultName: { color: "#f8fafc", fontSize: 22, fontWeight: "800", marginBottom: 4 },
    resultLoc: { color: "#94a3b8", fontSize: 14, marginBottom: 6 },
    resultDuration: { color: "#38bdf8", fontWeight: "600", fontSize: 14 },

    // ── Drawer ──
    drawer: {
        backgroundColor: "rgba(15,23,42,0.95)",
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 32,
        borderTopWidth: 1,
        borderColor: "#1e293b",
    },
    drawerTitle: {
        color: "#64748b",
        fontSize: 11,
        fontWeight: "700",
        letterSpacing: 1,
        textTransform: "uppercase",
        marginBottom: 10,
    },
    drawerEmpty: { color: "#334155", fontSize: 13, textAlign: "center", paddingVertical: 8 },
    scanRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 9,
        borderBottomWidth: 1,
        borderColor: "#1e293b",
        gap: 10,
    },
    scanDot: { width: 8, height: 8, borderRadius: 4 },
    scanRowText: { flex: 1 },
    scanName: { color: "#e2e8f0", fontSize: 14, fontWeight: "600" },
    scanLoc: { color: "#475569", fontSize: 11, marginTop: 1 },
    scanBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 100,
    },
    scanBadgeText: { fontSize: 11, fontWeight: "700" },

    // ── Settings modal ──
    modalRoot: {
        flex: 1,
        backgroundColor: "#0f172a",
        padding: 24,
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 32,
        marginTop: 12,
    },
    modalTitle: { color: "#f8fafc", fontSize: 20, fontWeight: "700" },
    modalClose: { color: "#0ea5e9", fontSize: 16, fontWeight: "600" },
    modalLabel: { color: "#94a3b8", fontSize: 12, fontWeight: "700", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6, marginTop: 20 },
    modalHint: { color: "#475569", fontSize: 13, marginBottom: 10 },
    modalInput: {
        backgroundColor: "#1e293b",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#334155",
        padding: 14,
        color: "#f1f5f9",
        fontSize: 15,
    },
    modalInfo: {
        backgroundColor: "#1e293b",
        borderRadius: 10,
        padding: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#334155",
    },
    modalInfoText: { color: "#e2e8f0", fontSize: 14 },
    modalInfoRole: {
        backgroundColor: "#0369a1",
        color: "#fff",
        fontSize: 11,
        fontWeight: "700",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 100,
        textTransform: "uppercase",
    },
    signOutBtn: {
        marginTop: 40,
        backgroundColor: "#7f1d1d",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
    },
    signOutText: { color: "#fca5a5", fontSize: 15, fontWeight: "700" },
});
