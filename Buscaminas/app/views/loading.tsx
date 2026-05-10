
import SurfaceCard from '@/components/ui/surface-card';
import { Colors, Fonts } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { ActivityIndicator, Text } from 'react-native';

export default function Loading() {
    const colorScheme = useColorScheme();
    const palette = Colors[colorScheme ?? 'light'];

    return (
        <LinearGradient
            colors={colorScheme === 'dark' ? [palette.background, palette.backgroundSoft] : [palette.background, '#dce8ee']}
            style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <SurfaceCard
                style={{
                    paddingHorizontal: 24,
                    paddingVertical: 20,
                    borderRadius: 18,
                    alignItems: 'center',
                    gap: 10,
                }}>
                <ActivityIndicator size="small" color={palette.tint} />
                <Text style={{ color: palette.textMuted, fontFamily: Fonts?.sans }}>Cargando...</Text>
            </SurfaceCard>
        </LinearGradient>
    );
}

