import "@react-navigation/native";

declare module "@react-navigation/native" {
  export type TabBarExtraEvents = {
    tabDoublePress: undefined;
    tabReselect: undefined;
    tabDoublePulse: undefined;
  };

  // Augment core map
  export interface EventMapCore extends TabBarExtraEvents {}
}
