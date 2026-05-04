// swift-tools-version: 5.9
import PackageDescription

// DO NOT MODIFY THIS FILE - managed by Capacitor CLI commands
let package = Package(
    name: "CapApp-SPM",
    platforms: [.iOS(.v15)],
    products: [
        .library(
            name: "CapApp-SPM",
            targets: ["CapApp-SPM"])
    ],
    dependencies: [
        .package(url: "https://github.com/ionic-team/capacitor-swift-pm.git", exact: "8.3.1"),
        .package(name: "CapacitorApp", path: "..\..\..\node_modules\@capacitor\app"),
        .package(name: "CapacitorHaptics", path: "..\..\..\node_modules\@capacitor\haptics"),
        .package(name: "CapacitorKeyboard", path: "..\..\..\node_modules\@capacitor\keyboard"),
        .package(name: "CapacitorPreferences", path: "..\..\..\node_modules\@capacitor\preferences"),
        .package(name: "CapacitorStatusBar", path: "..\..\..\node_modules\@capacitor\status-bar"),
        .package(name: "CapacitorSecureStoragePlugin", path: "..\..\..\node_modules\capacitor-secure-storage-plugin"),
        .package(name: "CapacitorUsbSerial", path: "..\..\..\node_modules\capacitor-usb-serial"),
        .package(name: "CordovaPluginBluetoothSerial", path: "../../capacitor-cordova-ios-plugins/sources/CordovaPluginBluetoothSerial"),
        .package(name: "CordovaPluginAndroidPermissions", path: "../../capacitor-cordova-ios-plugins/sources/CordovaPluginAndroidPermissions")
    ],
    targets: [
        .target(
            name: "CapApp-SPM",
            dependencies: [
                .product(name: "Capacitor", package: "capacitor-swift-pm"),
                .product(name: "Cordova", package: "capacitor-swift-pm"),
                .product(name: "CapacitorApp", package: "CapacitorApp"),
                .product(name: "CapacitorHaptics", package: "CapacitorHaptics"),
                .product(name: "CapacitorKeyboard", package: "CapacitorKeyboard"),
                .product(name: "CapacitorPreferences", package: "CapacitorPreferences"),
                .product(name: "CapacitorStatusBar", package: "CapacitorStatusBar"),
                .product(name: "CapacitorSecureStoragePlugin", package: "CapacitorSecureStoragePlugin"),
                .product(name: "CapacitorUsbSerial", package: "CapacitorUsbSerial"),
                .product(name: "CordovaPluginBluetoothSerial", package: "CordovaPluginBluetoothSerial"),
                .product(name: "CordovaPluginAndroidPermissions", package: "CordovaPluginAndroidPermissions")
            ]
        )
    ]
)
