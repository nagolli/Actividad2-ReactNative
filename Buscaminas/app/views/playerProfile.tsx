import AppButton from '@/components/ui/app-button';
import ScreenContainer from '@/components/ui/screen-container';
import SurfaceCard from '@/components/ui/surface-card';
import { Colors, Fonts } from '@/constants/theme';
import { deleteProfile, getActiveProfile, getAllProfiles, getGamesByProfile, insertProfile, setCurrentProfile } from '@/db/database';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { navigateToView, Views } from '@/utils/viewsEnum';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function PlayerProfile() {
    const colorScheme = useColorScheme();
    const palette = Colors[colorScheme ?? 'light'];

    const [profiles, setProfiles] = useState<any[]>([]);
    const [activeProfile, setActiveProfileState] = useState<any | null>(null);
    const [games, setGames] = useState<any[]>([]);
    const [showNewModal, setShowNewModal] = useState(false);
    const [newProfileName, setNewProfileName] = useState('');

    const loadProfiles = () => {
        try {
            const all = getAllProfiles();
            setProfiles(all);
            const active = getActiveProfile();
            setActiveProfileState(active);
            console.log('DB: perfiles cargados:', all.length, 'activo:', active?.id);
        } catch (err) {
            console.log('Error cargando perfiles:', err);
            Alert.alert('Error cargando perfiles', String(err));
        }
    };

    useEffect(() => {
        loadProfiles();
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadProfiles();
        }, [])
    );

    useEffect(() => {
        if (activeProfile) {
            const g = getGamesByProfile(activeProfile.id);
            setGames(g);
        } else {
            setGames([]);
        }
    }, [activeProfile]);

    const handleSelectProfile = async (profileId: number) => {
        try {
            await setCurrentProfile(profileId);
            loadProfiles();
        } catch (err) {
            console.log('Error al seleccionar perfil:', err);
        }
    };

    const handleDeleteProfile = (profileId: number, profileName: string) => {
        Alert.alert(
            'Eliminar perfil',
            `¿Seguro que quieres eliminar el perfil "${profileName}"?`,
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Eliminar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await deleteProfile(profileId);
                            loadProfiles();
                        } catch (err) {
                            console.log('Error al eliminar perfil:', err);
                            Alert.alert('Error al eliminar perfil', String(err));
                        }
                    },
                },
            ]
        );
    };

    const handleCreateProfile = async () => {
        if (!newProfileName.trim()) {
            Alert.alert('Nombre requerido', 'Escribe un nombre para el perfil');
            return;
        }

        try {
            await insertProfile(newProfileName.trim(), true);
            setShowNewModal(false);
            setNewProfileName('');
            loadProfiles();
            Alert.alert('Perfil creado', 'El perfil se creó correctamente');
        } catch (err) {
            console.log('Error al crear perfil:', err);
            const message = (err as any)?.message ? String((err as any).message) : String(err);
            Alert.alert('Error al crear perfil', message);
        }
    };

    const renderProfile = ({ item }: { item: any }) => {
        const isActive = activeProfile && activeProfile.id === item.id;
        return (
            <View style={[styles.profileRow, { borderColor: palette.border, backgroundColor: isActive ? palette.surfaceAlt : 'transparent' }]}> 
                <TouchableOpacity onPress={() => handleSelectProfile(item.id)} style={styles.profileInfo}>
                    <Text style={[styles.profileName, { color: palette.text }]}>{item.name}</Text>
                    {isActive ? <Text style={[styles.activeTag, { color: palette.tint }]}>Activo</Text> : null}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteProfile(item.id, item.name)} style={[styles.deleteButton, { backgroundColor: palette.danger }]}> 
                    <Text style={styles.deleteButtonText}>Borrar</Text>
                </TouchableOpacity>
            </View>
        );
    };

    const renderGame = ({ item }: { item: any }) => {
        const date = new Date(item.played_at);
        const resultText = item.result === 1 ? 'Victoria' : 'Derrota';
        const formattedDate = date.toLocaleString('es-ES', {
            dateStyle: 'short',
            timeStyle: 'short',
        });
        return (
            <View style={[styles.gameRow, { borderColor: palette.border, backgroundColor: palette.surfaceAlt }]}> 
                <Text style={[styles.gameTitle, { color: palette.text }]}>{resultText} — {item.time}s</Text>
                <Text style={[styles.gameMeta, { color: palette.textMuted }]}>{formattedDate} • {item.bombs} bombas • {item.columns}x{item.rows}</Text>
            </View>
        );
    };

    return (
        <ScreenContainer contentContainerStyle={styles.gradient} lightEndColor="#e0ebf1">
            <SurfaceCard style={styles.container}>
                <Text style={[styles.title, { color: palette.text }]}>Perfiles</Text>
                <Text style={[styles.description, { color: palette.textMuted }]}>Selecciona o crea un perfil para ver su historial de partidas.</Text>

                <FlatList
                    data={profiles}
                    keyExtractor={(p) => String(p.id)}
                    renderItem={renderProfile}
                    style={[styles.list, { marginTop: 12, marginBottom: 8 }]}
                    nestedScrollEnabled
                    ListEmptyComponent={<Text style={[styles.placeholderText, { color: palette.textMuted }]}>No hay perfiles aún</Text>}
                />
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                    <AppButton label="Crear perfil" onPress={() => setShowNewModal(true)} variant="accent" style={styles.button} />
                    <AppButton label="Configurar nueva partida" onPress={() => navigateToView(Views.Init)} variant="soft" style={styles.button} />
                    <AppButton label="Recargar" onPress={loadProfiles} variant="soft" style={styles.button} />
                </View>

                <Text style={[styles.debugText, { color: palette.textMuted, marginTop: 8 }]}>Perfiles en DB: {profiles.length} {activeProfile ? `• Perfil activo: ${activeProfile.name}` : ''}</Text>

                <Text style={[styles.sectionTitle, { color: palette.text, marginTop: 18 }]}>Historial</Text>
                {activeProfile ? (
                    <FlatList
                        data={games}
                        keyExtractor={(g) => String(g.id)}
                        renderItem={renderGame}
                        style={[styles.list, { marginTop: 8 }]}
                        nestedScrollEnabled
                        ListEmptyComponent={<Text style={[styles.placeholderText, { color: palette.textMuted }]}>No hay partidas para este perfil</Text>}
                    />
                ) : (
                    <Text style={[styles.placeholderText, { color: palette.textMuted, marginTop: 8 }]}>Selecciona un perfil para ver su historial</Text>
                )}
            </SurfaceCard>

            <Modal visible={showNewModal} transparent animationType="fade" onRequestClose={() => setShowNewModal(false)}>
                <View style={modalStyles.backdrop}>
                    <SurfaceCard style={modalStyles.card}>
                        <Text style={[modalStyles.title, { color: palette.text }]}>Nuevo perfil</Text>
                        <TextInput
                            placeholder="Nombre del perfil"
                            placeholderTextColor={palette.textMuted}
                            value={newProfileName}
                            onChangeText={setNewProfileName}
                            style={[modalStyles.input, { color: palette.text, borderColor: palette.border }]}
                        />
                        <AppButton label="Crear" onPress={handleCreateProfile} variant="accent" style={{ marginTop: 12 }} />
                        <AppButton label="Cancelar" onPress={() => setShowNewModal(false)} variant="soft" style={{ marginTop: 8 }} />
                    </SurfaceCard>
                </View>
            </Modal>
        </ScreenContainer>
    );
}

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
        justifyContent: 'center',
        padding: 18,
        paddingBottom: 96,
    },
    container: {
        shadowRadius: 18,
        shadowOffset: { width: 0, height: 8 },
    },
    title: {
        fontSize: 30,
        fontWeight: '700',
        fontFamily: Fonts?.rounded,
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        lineHeight: 22,
        fontFamily: Fonts?.sans,
        marginBottom: 18,
    },
    placeholderCard: {
        borderWidth: 1,
        borderRadius: 14,
        padding: 16,
        marginBottom: 18,
    },
    placeholderText: {
        fontSize: 15,
        fontFamily: Fonts?.rounded,
        fontWeight: '600',
    },
    button: {
        paddingVertical: 14,
    },
    profileRow: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        marginBottom: 8,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    profileName: {
        fontSize: 16,
        fontFamily: Fonts?.rounded,
        fontWeight: '700',
    },
    activeTag: {
        fontSize: 13,
        fontFamily: Fonts?.sans,
        fontWeight: '700',
    },
    profileInfo: {
        flex: 1,
    },
    deleteButton: {
        paddingVertical: 8,
        paddingHorizontal: 10,
        borderRadius: 10,
        marginLeft: 10,
    },
    deleteButtonText: {
        color: '#ffffff',
        fontWeight: '700',
        fontFamily: Fonts?.rounded,
        fontSize: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: Fonts?.rounded,
    },
    gameRow: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
    },
    gameTitle: {
        fontSize: 15,
        fontWeight: '700',
        fontFamily: Fonts?.rounded,
        marginBottom: 4,
    },
    gameMeta: {
        fontSize: 13,
        fontFamily: Fonts?.sans,
    },
    debugText: {
        fontSize: 13,
        fontFamily: Fonts?.sans,
    },
    list: {
        maxHeight: 220,
    },
});

const modalStyles = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(8, 14, 20, 0.45)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: '100%',
        maxWidth: 360,
        padding: 16,
        borderRadius: 12,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginTop: 6,
    },
});