import Vue from "vue";
import Vuex from 'vuex';
import { env } from '../now.json';

export function createStore() {
    return new Vuex.Store({
        state: {
            location: {},
            localTemp: '',
            baseURL: 'https://api.openweathermap.org/data/2.5/weather'
        },
        mutations: {
            setLocation (state, data) {
                state.location = data;
            },
            setLocalTemp (state, data) {
                state.localTemp = data;
            }
        },
        actions: {
            getTempertureInformation(context) {
                var self = this;
                return new Promise(resolve => {
                    navigator.geolocation.getCurrentPosition( position => {
                        context.commit('setLocation', {lat: position.coords.latitude, lng: position.coords.longitude});
                        getTempForGeoLocation();
                    });

                    function getTempForGeoLocation() {
                        let query = '?lat='+ self.state.location.lat +'&lon='+ self.state.location.lng;
                        let url = self.state.baseURL + query + '&APPID=' + env.OW_API_KEY;
                        Vue.http.get(url, self.state.config)
                            .then(response => {
                                context.commit('setLocalTemp', response.body.main.temp);
                            });
                    }
                    resolve();
                });
            }
        }
    });
}