// ─── Login Screen ─────────────────────────────────────────────────────────────
import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { apiLogin } from "../api";
import { useAuth } from "../AuthContext";

export default function LoginScreen() {
    const { signIn } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email.trim() || !password) {
            Alert.alert("Missing fields", "Please enter your email and password.");
            return;
        }
        setLoading(true);
        try {
            const result = await apiLogin(email.trim().toLowerCase(), password);
            await signIn(result.token, result.user);
        } catch (err: any) {
            Alert.alert("Login failed", err.message || "Invalid credentials");
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.root}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <StatusBar style="light" />

            {/* Background gradient overlay */}
            <View style={styles.bg} />

            <View style={styles.card}>
                {/* Logo area */}
                <View style={styles.logoWrap}>
                    <View style={styles.logoIcon}>
                        <Text style={styles.logoText}>HG</Text>
                    </View>
                    <Text style={styles.logoName}>HallGuardian</Text>
                </View>

                <Text style={styles.title}>Staff Sign In</Text>
                <Text style={styles.subtitle}>
                    Sign in to start scanning hall passes
                </Text>

                <View style={styles.field}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="teacher@school.edu"
                        placeholderTextColor="#94a3b8"
                        autoCapitalize="none"
                        keyboardType="email-address"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View style={styles.field}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="••••••••"
                        placeholderTextColor="#94a3b8"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                        onSubmitEditing={handleLogin}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.btn, loading && styles.btnDisabled]}
                    onPress={handleLogin}
                    activeOpacity={0.85}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.btnText}>Sign In →</Text>
                    )}
                </TouchableOpacity>

                <Text style={styles.hint}>
                    Contact your school admin if you need access.
                </Text>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: "#0f172a",
        justifyContent: "center",
        alignItems: "center",
        padding: 24,
    },
    bg: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#0f172a",
    },
    card: {
        width: "100%",
        maxWidth: 400,
        backgroundColor: "#1e293b",
        borderRadius: 24,
        padding: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 24,
        elevation: 16,
        borderWidth: 1,
        borderColor: "#334155",
    },
    logoWrap: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 28,
        justifyContent: "center",
    },
    logoIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: "#0369a1",
        alignItems: "center",
        justifyContent: "center",
    },
    logoText: {
        color: "#fff",
        fontWeight: "900",
        fontSize: 15,
    },
    logoName: {
        color: "#e2e8f0",
        fontWeight: "700",
        fontSize: 20,
        letterSpacing: -0.5,
    },
    title: {
        color: "#f8fafc",
        fontSize: 26,
        fontWeight: "800",
        letterSpacing: -0.5,
        marginBottom: 6,
        textAlign: "center",
    },
    subtitle: {
        color: "#64748b",
        fontSize: 14,
        textAlign: "center",
        marginBottom: 28,
    },
    field: {
        marginBottom: 16,
    },
    label: {
        color: "#94a3b8",
        fontSize: 13,
        fontWeight: "600",
        marginBottom: 6,
        letterSpacing: 0.3,
    },
    input: {
        backgroundColor: "#0f172a",
        borderWidth: 1,
        borderColor: "#334155",
        borderRadius: 10,
        padding: 14,
        color: "#f1f5f9",
        fontSize: 15,
    },
    btn: {
        backgroundColor: "#0369a1",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        marginTop: 8,
        marginBottom: 16,
        shadowColor: "#0369a1",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
    },
    btnDisabled: {
        opacity: 0.6,
    },
    btnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    hint: {
        color: "#475569",
        fontSize: 12,
        textAlign: "center",
    },
});
