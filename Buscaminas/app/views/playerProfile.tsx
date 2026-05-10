import AppButton from '@/components/ui/app-button';
import SurfaceCard from '@/components/ui/surface-card';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { navigateToView, Views } from '@/utils/viewsEnum';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

export default function PlayerProfile() {
    // TODO: Implementar botón para ir a nueva partida (navigateToView(Views.SelectMode))

    // TODO: Implementar desplegable con cada perfil guardado (con nombre), el seleccionado se marca como activo en BBDD y se muestra su historial de partidas

    // TODO: Implementar botón para crear nuevo perfil (con input para nombre)

    // TODO: Implementar lista de partidas guardadas para el perfil seleccionado (fecha, configuración, resultado, ...)

    const colorScheme = useColorScheme();
    const palette = Colors[colorScheme ?? 'light'];

    return <LinearGradient
        colors={colorScheme === 'dark' ? [palette.background, palette.backgroundSoft] : [palette.background, '#e0ebf1']}
        style={styles.gradient}>
        <SurfaceCard style={styles.container}>
            <Text style={[styles.title, { color: palette.text }]}>Perfil</Text>
            <Text style={[styles.description, { color: palette.textMuted }]}>Esta sección estará disponible pronto con gestión completa de perfiles e historial.</Text>

            <View style={[styles.placeholderCard, { borderColor: palette.border, backgroundColor: palette.surfaceAlt }]}>
                <Text style={[styles.placeholderText, { color: palette.text }]}>Sin datos de perfil aún</Text>
            </View>

            <AppButton label="Configurar nueva partida" onPress={() => navigateToView(Views.Init)} variant="accent" style={styles.button} />
        </SurfaceCard>
    </LinearGradient>
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
});