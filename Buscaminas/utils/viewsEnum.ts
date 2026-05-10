import { router } from 'expo-router';

export enum Views {
    Init = './init',
    Game = './game',
    Profile = './profile',
}

export const navigateToView = (view: Views) => {
    router.replace(view);
};