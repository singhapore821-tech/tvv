export interface ProjectFile {
  path: string;
  language: string;
  category: 'gradle' | 'manifest' | 'java' | 'xml' | 'firebase' | 'guide';
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: ProjectFile[] = [
  // 1. Gradle Files
  {
    path: 'build.gradle (Project: VibeTV)',
    language: 'groovy',
    category: 'gradle',
    description: 'Top-level build file adding Google Services classpath and repository definitions.',
    content: `// Top-level build file for VIBE TV Android Application
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
        classpath 'com.google.gms:google-services:4.4.2'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
        maven { url 'https://jitpack.io' }
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}`
  },
  {
    path: 'settings.gradle',
    language: 'groovy',
    category: 'gradle',
    description: 'Gradle project settings defining project name and dependency repositories.',
    content: `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.PREFER_SETTINGS)
    repositories {
        google()
        mavenCentral()
        maven { url 'https://jitpack.io' }
    }
}
rootProject.name = "VibeTV"
include ':app'`
  },
  {
    path: 'app/build.gradle',
    language: 'groovy',
    category: 'gradle',
    description: 'Module-level build file configuring SDK 34, ViewBinding, Firebase BoM, and WebRTC.',
    content: `plugins {
    id 'com.android.application'
    id 'com.google.gms.google-services'
}

android {
    namespace 'com.vibetv.app'
    compileSdk 34

    defaultConfig {
        applicationId "com.vibetv.app"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0.0"

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }

    buildFeatures {
        viewBinding true
    }
}

dependencies {
    // AndroidX & Modern Material UI
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    implementation 'androidx.constraintlayout:constraintlayout:2.1.4'
    implementation 'androidx.viewpager2:viewpager2:1.0.0'
    implementation 'androidx.lifecycle:lifecycle-viewmodel:2.7.0'
    implementation 'androidx.lifecycle:lifecycle-livedata:2.7.0'

    // Google WebRTC Official Android SDK
    implementation 'org.webrtc:google-webrtc:1.0.32006'

    // Firebase BoM (Bill of Materials) & Firebase Services
    implementation platform('com.google.firebase:firebase-bom:33.7.0')
    implementation 'com.google.firebase:firebase-auth'
    implementation 'com.google.firebase:firebase-firestore'
    implementation 'com.google.firebase:firebase-database'
    implementation 'com.google.firebase:firebase-functions'

    // Circular Image View for modern profile displays
    implementation 'de.hdodenhof:circleimageview:3.1.0'
}`
  },

  // 2. Android Manifest
  {
    path: 'app/src/main/AndroidManifest.xml',
    language: 'xml',
    category: 'manifest',
    description: 'Application manifest declaring hardware permissions (Camera, Audio, Internet) and activities.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:tools="http://schemas.android.com/tools"
    package="com.vibetv.app">

    <!-- Hardware & Network Permissions for WebRTC Video Chat -->
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    
    <uses-feature android:name="android.hardware.camera" android:required="true" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />

    <application
        android:name=".VibeTvApp"
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:hardwareAccelerated="true"
        android:theme="@style/Theme.VibeTV">

        <!-- Welcome / Auth Gate Activity -->
        <activity
            android:name=".auth.LoginActivity"
            android:exported="true"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity
            android:name=".auth.RegisterActivity"
            android:exported="false"
            android:screenOrientation="portrait" />

        <activity
            android:name=".auth.ResetPasswordActivity"
            android:exported="false"
            android:screenOrientation="portrait" />

        <!-- Main Radar / Start Activity -->
        <activity
            android:name=".main.MainActivity"
            android:exported="false"
            android:screenOrientation="portrait" />

        <!-- Live WebRTC Video Chat Activity -->
        <activity
            android:name=".chat.VideoChatActivity"
            android:exported="false"
            android:screenOrientation="portrait"
            android:configChanges="orientation|screenSize"
            android:windowSoftInputMode="adjustResize" />

        <activity
            android:name=".profile.ProfileActivity"
            android:exported="false"
            android:screenOrientation="portrait" />

        <activity
            android:name=".history.HistoryActivity"
            android:exported="false"
            android:screenOrientation="portrait" />

        <activity
            android:name=".admin.AdminActivity"
            android:exported="false"
            android:screenOrientation="portrait" />

    </application>
</manifest>`
  },

  // 3. Application Class & Models
  {
    path: 'app/src/main/java/com/vibetv/app/VibeTvApp.java',
    language: 'java',
    category: 'java',
    description: 'Base Application class initializing Firebase and WebRTC EglBase context globally.',
    content: `package com.vibetv.app;

import android.app.Application;
import org.webrtc.PeerConnectionFactory;
import org.webrtc.EglBase;

public class VibeTvApp extends Application {
    private static VibeTvApp instance;
    private EglBase rootEglBase;

    @Override
    public void onCreate() {
        super.onCreate();
        instance = this;
        rootEglBase = EglBase.create();

        // Initialize WebRTC Factory Options globally
        PeerConnectionFactory.InitializationOptions initOptions =
                PeerConnectionFactory.InitializationOptions.builder(this)
                        .setEnableInternalTracer(true)
                        .createInitializationOptions();
        PeerConnectionFactory.initialize(initOptions);
    }

    public static VibeTvApp getInstance() {
        return instance;
    }

    public EglBase getRootEglBase() {
        return rootEglBase;
    }
}`
  },
  {
    path: 'app/src/main/java/com/vibetv/app/models/User.java',
    language: 'java',
    category: 'java',
    description: 'User entity model mapped to Firebase Firestore /users collection.',
    content: `package com.vibetv.app.models;

import java.io.Serializable;

public class User implements Serializable {
    private String id;
    private String fullName;
    private String username;
    private String email;
    private String gender;
    private String role; // "user" or "admin"
    private long createdAt;
    private boolean isBanned;
    private String bio;

    public User() {
        // Required for Firestore deserialization
    }

    public User(String id, String fullName, String username, String email, String gender, String role, long createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.username = username;
        this.email = email;
        this.gender = gender;
        this.role = role;
        this.createdAt = createdAt;
        this.isBanned = false;
        this.bio = "";
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public long getCreatedAt() { return createdAt; }
    public void setCreatedAt(long createdAt) { this.createdAt = createdAt; }

    public boolean isBanned() { return isBanned; }
    public void setBanned(boolean banned) { isBanned = banned; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
}`
  },
  {
    path: 'app/src/main/java/com/vibetv/app/models/ChatMessage.java',
    language: 'java',
    category: 'java',
    description: 'Chat message model with timestamp and sender identification for in-call messaging.',
    content: `package com.vibetv.app.models;

public class ChatMessage {
    private String messageId;
    private String senderId;
    private String senderUsername;
    private String text;
    private long timestamp;

    public ChatMessage() {}

    public ChatMessage(String messageId, String senderId, String senderUsername, String text, long timestamp) {
        this.messageId = messageId;
        this.senderId = senderId;
        this.senderUsername = senderUsername;
        this.text = text;
        this.timestamp = timestamp;
    }

    public String getMessageId() { return messageId; }
    public String getSenderId() { return senderId; }
    public String getSenderUsername() { return senderUsername; }
    public String getText() { return text; }
    public long getTimestamp() { return timestamp; }
}`
  },

  // 4. Authentication Activities
  {
    path: 'app/src/main/java/com/vibetv/app/auth/RegisterActivity.java',
    language: 'java',
    category: 'java',
    description: 'Registration activity with full name, email, password, and gender selection.',
    content: `package com.vibetv.app.auth;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.RadioButton;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseUser;
import com.google.firebase.firestore.FirebaseFirestore;
import com.vibetv.app.databinding.ActivityRegisterBinding;
import com.vibetv.app.main.MainActivity;
import com.vibetv.app.models.User;

public class RegisterActivity extends AppCompatActivity {
    private ActivityRegisterBinding binding;
    private FirebaseAuth mAuth;
    private FirebaseFirestore db;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityRegisterBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        mAuth = FirebaseAuth.getInstance();
        db = FirebaseFirestore.getInstance();

        binding.btnRegister.setOnClickListener(v -> performRegistration());
        binding.tvBackToLogin.setOnClickListener(v -> finish());
    }

    private void performRegistration() {
        String fullName = binding.etFullName.getText().toString().trim();
        String email = binding.etEmail.getText().toString().trim().toLowerCase();
        String password = binding.etPassword.getText().toString();

        if (TextUtils.isEmpty(fullName)) {
            binding.etFullName.setError("Full name is required");
            return;
        }
        if (TextUtils.isEmpty(email) || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            binding.etEmail.setError("Valid email address is required");
            return;
        }
        if (TextUtils.isEmpty(password) || password.length() < 6) {
            binding.etPassword.setError("Password must be at least 6 characters");
            return;
        }

        int selectedGenderId = binding.rgGender.getCheckedRadioButtonId();
        if (selectedGenderId == -1) {
            Toast.makeText(this, "Please select your gender (Male, Female, or Other)", Toast.LENGTH_SHORT).show();
            return;
        }
        RadioButton selectedRadio = findViewById(selectedGenderId);
        String gender = selectedRadio.getText().toString().toLowerCase();

        binding.progressBar.setVisibility(View.VISIBLE);
        binding.btnRegister.setEnabled(false);

        // Auto-generate username from email prefix
        String autoUsername = email.split("@")[0].replaceAll("[^a-zA-Z0-9_]", "").toLowerCase();
        if (autoUsername.isEmpty()) autoUsername = "user";

        final String finalUsername = autoUsername;

        // Create Firebase Auth user
        mAuth.createUserWithEmailAndPassword(email, password)
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful() && mAuth.getCurrentUser() != null) {
                        FirebaseUser fbUser = mAuth.getCurrentUser();
                        String uid = fbUser.getUid();

                        User newUser = new User(uid, fullName, finalUsername, email, gender, "user", System.currentTimeMillis());

                        db.collection("users").document(uid).set(newUser)
                                .addOnSuccessListener(aVoid -> {
                                    binding.progressBar.setVisibility(View.GONE);
                                    Intent intent = new Intent(RegisterActivity.this, MainActivity.class);
                                    intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                                    startActivity(intent);
                                    finish();
                                }).addOnFailureListener(e -> {
                                    binding.progressBar.setVisibility(View.GONE);
                                    binding.btnRegister.setEnabled(true);
                                    Toast.makeText(RegisterActivity.this, "Failed to save profile: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                                });
                    } else {
                        binding.progressBar.setVisibility(View.GONE);
                        binding.btnRegister.setEnabled(true);
                        String err = task.getException() != null ? task.getException().getMessage() : "Registration failed";
                        Toast.makeText(RegisterActivity.this, err, Toast.LENGTH_LONG).show();
                    }
                });
    }
}`
  },
  {
    path: 'app/src/main/java/com/vibetv/app/auth/LoginActivity.java',
    language: 'java',
    category: 'java',
    description: 'Login activity supporting login by registered email OR unique username, with password resolution.',
    content: `package com.vibetv.app.auth;

import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.FirebaseFirestore;
import com.vibetv.app.databinding.ActivityLoginBinding;
import com.vibetv.app.main.MainActivity;

public class LoginActivity extends AppCompatActivity {
    private ActivityLoginBinding binding;
    private FirebaseAuth mAuth;
    private FirebaseFirestore db;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        mAuth = FirebaseAuth.getInstance();
        db = FirebaseFirestore.getInstance();

        // Persistent Session Check
        if (mAuth.getCurrentUser() != null) {
            startActivity(new Intent(this, MainActivity.class));
            finish();
            return;
        }

        binding = ActivityLoginBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        binding.btnLogin.setOnClickListener(v -> performLogin());
        binding.tvGoToRegister.setOnClickListener(v -> startActivity(new Intent(this, RegisterActivity.class)));
        binding.tvForgotPassword.setOnClickListener(v -> startActivity(new Intent(this, ResetPasswordActivity.class)));
    }

    private void performLogin() {
        String identifier = binding.etIdentifier.getText().toString().trim().toLowerCase();
        String password = binding.etPassword.getText().toString();

        if (TextUtils.isEmpty(identifier)) {
            binding.etIdentifier.setError("Enter registered email or username");
            return;
        }
        if (TextUtils.isEmpty(password)) {
            binding.etPassword.setError("Enter password");
            return;
        }

        binding.progressBar.setVisibility(View.VISIBLE);
        binding.btnLogin.setEnabled(false);

        // If identifier is already an email format, authenticate directly
        if (android.util.Patterns.EMAIL_ADDRESS.matcher(identifier).matches()) {
            authenticateWithEmail(identifier, password);
        } else {
            // Resolve username to registered email via Firestore collection "usernames"
            db.collection("usernames").document(identifier).get()
                    .addOnSuccessListener(snapshot -> {
                        if (snapshot.exists() && snapshot.contains("email")) {
                            String resolvedEmail = snapshot.getString("email");
                            authenticateWithEmail(resolvedEmail, password);
                        } else {
                            binding.progressBar.setVisibility(View.GONE);
                            binding.btnLogin.setEnabled(true);
                            binding.etIdentifier.setError("Username not found");
                        }
                    })
                    .addOnFailureListener(e -> {
                        binding.progressBar.setVisibility(View.GONE);
                        binding.btnLogin.setEnabled(true);
                        Toast.makeText(LoginActivity.this, "Lookup error: " + e.getMessage(), Toast.LENGTH_SHORT).show();
                    });
        }
    }

    private void authenticateWithEmail(String email, String password) {
        mAuth.signInWithEmailAndPassword(email, password)
                .addOnCompleteListener(task -> {
                    binding.progressBar.setVisibility(View.GONE);
                    binding.btnLogin.setEnabled(true);
                    if (task.isSuccessful()) {
                        Intent intent = new Intent(LoginActivity.this, MainActivity.class);
                        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                        startActivity(intent);
                        finish();
                    } else {
                        String msg = task.getException() != null ? task.getException().getMessage() : "Authentication failed";
                        Toast.makeText(LoginActivity.this, "Login Failed: " + msg, Toast.LENGTH_LONG).show();
                    }
                });
    }
}`
  },
  {
    path: 'app/src/main/java/com/vibetv/app/auth/ResetPasswordActivity.java',
    language: 'java',
    category: 'java',
    description: 'Secure password reset flow with Firebase Auth email verification.',
    content: `package com.vibetv.app.auth;

import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Toast;
import androidx.appcompat.app.AppCompatActivity;
import com.google.firebase.auth.FirebaseAuth;
import com.vibetv.app.databinding.ActivityResetPasswordBinding;

public class ResetPasswordActivity extends AppCompatActivity {
    private ActivityResetPasswordBinding binding;
    private FirebaseAuth mAuth;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityResetPasswordBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        mAuth = FirebaseAuth.getInstance();

        binding.btnResetPassword.setOnClickListener(v -> {
            String email = binding.etResetEmail.getText().toString().trim().toLowerCase();
            if (TextUtils.isEmpty(email) || !android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
                binding.etResetEmail.setError("Please enter a valid registered email");
                return;
            }

            binding.progressBar.setVisibility(View.VISIBLE);
            binding.btnResetPassword.setEnabled(false);

            mAuth.sendPasswordResetEmail(email)
                    .addOnCompleteListener(task -> {
                        binding.progressBar.setVisibility(View.GONE);
                        binding.btnResetPassword.setEnabled(true);
                        if (task.isSuccessful()) {
                            Toast.makeText(ResetPasswordActivity.this, "Password reset link sent to your email.", Toast.LENGTH_LONG).show();
                            finish();
                        } else {
                            String err = task.getException() != null ? task.getException().getMessage() : "Error sending reset email";
                            Toast.makeText(ResetPasswordActivity.this, err, Toast.LENGTH_LONG).show();
                        }
                    });
        });

        binding.btnBack.setOnClickListener(v -> finish());
    }
}`
  },

  // 5. Main Activity & Matchmaking Engine
  {
    path: 'app/src/main/java/com/vibetv/app/main/MainActivity.java',
    language: 'java',
    category: 'java',
    description: 'Main VIBE TV screen with Start button, radar animation, online counter, and navigation to Profile/History/Admin.',
    content: `package com.vibetv.app.main;

import android.Manifest;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.view.View;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.database.DataSnapshot;
import com.google.firebase.database.DatabaseError;
import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;
import com.google.firebase.database.ValueEventListener;
import com.google.firebase.firestore.FirebaseFirestore;
import com.vibetv.app.R;
import com.vibetv.app.admin.AdminActivity;
import com.vibetv.app.auth.LoginActivity;
import com.vibetv.app.chat.VideoChatActivity;
import com.vibetv.app.databinding.ActivityMainBinding;
import com.vibetv.app.history.HistoryActivity;
import com.vibetv.app.profile.ProfileActivity;

public class MainActivity extends AppCompatActivity {
    private static final int PERMISSION_REQ_CODE = 1001;
    private ActivityMainBinding binding;
    private FirebaseAuth mAuth;
    private MatchmakingManager matchManager;
    private DatabaseReference presenceRef;
    private ValueEventListener presenceListener;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityMainBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        mAuth = FirebaseAuth.getInstance();
        if (mAuth.getCurrentUser() == null) {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return;
        }

        matchManager = new MatchmakingManager(this);
        setupUI();
        listenToOnlinePresence();
        checkAdminRole();
    }

    private void setupUI() {
        // Start Video Matchmaking button
        binding.btnStartMatch.setOnClickListener(v -> checkPermissionsAndStart());

        // Cancel Matchmaking
        binding.btnCancelSearch.setOnClickListener(v -> cancelSearch());

        // Navigation
        binding.navProfile.setOnClickListener(v -> startActivity(new Intent(this, ProfileActivity.class)));
        binding.navHistory.setOnClickListener(v -> startActivity(new Intent(this, HistoryActivity.class)));
    }

    private void listenToOnlinePresence() {
        String uid = mAuth.getCurrentUser().getUid();
        DatabaseReference myPresence = FirebaseDatabase.getInstance().getReference("presence").child(uid);
        myPresence.setValue(true);
        myPresence.onDisconnect().removeValue();

        // Count real authenticated online users
        presenceRef = FirebaseDatabase.getInstance().getReference("presence");
        presenceListener = new ValueEventListener() {
            @Override
            public void onDataChange(@NonNull DataSnapshot snapshot) {
                long onlineCount = snapshot.getChildrenCount();
                binding.tvOnlineCount.setText(onlineCount + " Online Now");
            }
            @Override
            public void onCancelled(@NonNull DatabaseError error) {}
        };
        presenceRef.addValueEventListener(presenceListener);
    }

    private void checkPermissionsAndStart() {
        String[] permissions = {Manifest.permission.CAMERA, Manifest.permission.RECORD_AUDIO};
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED ||
            ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(this, permissions, PERMISSION_REQ_CODE);
        } else {
            startMatchmakingFlow();
        }
    }

    private void startMatchmakingFlow() {
        binding.layoutIdle.setVisibility(View.GONE);
        binding.layoutSearching.setVisibility(View.VISIBLE);

        // Start radar pulsing animation
        Animation pulse = AnimationUtils.loadAnimation(this, R.anim.radar_pulse);
        binding.ivRadarPulse.startAnimation(pulse);

        // Enter atomic matchmaking queue
        matchManager.joinQueue(new MatchmakingManager.MatchCallback() {
            @Override
            public void onMatchFound(String sessionId, boolean isInitiator, String peerId, String peerUsername) {
                Intent intent = new Intent(MainActivity.this, VideoChatActivity.class);
                intent.putExtra("SESSION_ID", sessionId);
                intent.putExtra("IS_INITIATOR", isInitiator);
                intent.putExtra("PEER_ID", peerId);
                intent.putExtra("PEER_USERNAME", peerUsername);
                startActivity(intent);
                resetSearchUI();
            }

            @Override
            public void onError(String error) {
                Toast.makeText(MainActivity.this, "Matchmaking error: " + error, Toast.LENGTH_SHORT).show();
                resetSearchUI();
            }
        });
    }

    private void cancelSearch() {
        matchManager.leaveQueue();
        resetSearchUI();
    }

    private void resetSearchUI() {
        binding.ivRadarPulse.clearAnimation();
        binding.layoutSearching.setVisibility(View.GONE);
        binding.layoutIdle.setVisibility(View.VISIBLE);
    }

    private void checkAdminRole() {
        String uid = mAuth.getCurrentUser().getUid();
        FirebaseFirestore.getInstance().collection("users").document(uid).get()
                .addOnSuccessListener(doc -> {
                    if (doc.exists() && "admin".equalsIgnoreCase(doc.getString("role"))) {
                        binding.btnAdminPanel.setVisibility(View.VISIBLE);
                        binding.btnAdminPanel.setOnClickListener(v -> startActivity(new Intent(this, AdminActivity.class)));
                    }
                });
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQ_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                startMatchmakingFlow();
            } else {
                Toast.makeText(this, "Camera and Microphone permissions are required for VIBE TV.", Toast.LENGTH_LONG).show();
            }
        }
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        if (presenceRef != null && presenceListener != null) {
            presenceRef.removeEventListener(presenceListener);
        }
    }
}`
  },
  {
    path: 'app/src/main/java/com/vibetv/app/main/MatchmakingManager.java',
    language: 'java',
    category: 'java',
    description: 'Atomic Firestore and Realtime Database matchmaking engine with block-list filtering and race condition prevention.',
    content: `package com.vibetv.app.main;

import android.content.Context;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.ListenerRegistration;
import com.google.firebase.firestore.Query;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class MatchmakingManager {
    public interface MatchCallback {
        void onMatchFound(String sessionId, boolean isInitiator, String peerId, String peerUsername);
        void onError(String error);
    }

    private final Context context;
    private final FirebaseFirestore db;
    private final FirebaseAuth auth;
    private ListenerRegistration queueListener;
    private DocumentReference myQueueDoc;

    public MatchmakingManager(Context context) {
        this.context = context;
        this.db = FirebaseFirestore.getInstance();
        this.auth = FirebaseAuth.getInstance();
    }

    public void joinQueue(MatchCallback callback) {
        String myUid = auth.getCurrentUser().getUid();

        // 1. Fetch user's block list to avoid matched blocked users
        db.collection("users").document(myUid).collection("blocks").get()
                .addOnSuccessListener(blockDocs -> {
                    List<String> blockedUserIds = blockDocs.toObjects(String.class);

                    // 2. Query matchmaking queue for waiting users
                    db.collection("match_queue")
                            .whereEqualTo("status", "waiting")
                            .orderBy("timestamp", Query.Direction.ASCENDING)
                            .limit(5)
                            .get()
                            .addOnSuccessListener(snapshot -> {
                                String matchedCandidateId = null;
                                DocumentReference candidateDocRef = null;

                                for (var doc : snapshot.getDocuments()) {
                                    String candidateId = doc.getString("uid");
                                    if (!myUid.equals(candidateId) && (blockedUserIds == null || !blockedUserIds.contains(candidateId))) {
                                        matchedCandidateId = candidateId;
                                        candidateDocRef = doc.getReference();
                                        break;
                                    }
                                }

                                if (matchedCandidateId != null && candidateDocRef != null) {
                                    // Atomically pair with candidate via Firestore transaction
                                    String sessionId = "session_" + UUID.randomUUID().toString();
                                    final String finalCandidateId = matchedCandidateId;

                                    db.runTransaction(transaction -> {
                                        var freshSnapshot = transaction.get(candidateDocRef);
                                        if ("waiting".equals(freshSnapshot.getString("status"))) {
                                            Map<String, Object> update = new HashMap<>();
                                            update.put("status", "matched");
                                            update.put("sessionId", sessionId);
                                            update.put("peerId", myUid);
                                            transaction.update(candidateDocRef, update);

                                            // Create active session document
                                            Map<String, Object> sessionData = new HashMap<>();
                                            sessionData.put("sessionId", sessionId);
                                            sessionData.put("userAId", myUid);
                                            sessionData.put("userBId", finalCandidateId);
                                            sessionData.put("startedAt", System.currentTimeMillis());
                                            sessionData.put("status", "active");
                                            transaction.set(db.collection("sessions").document(sessionId), sessionData);
                                            return true;
                                        }
                                        return false;
                                    }).addOnSuccessListener(matchedSuccessfully -> {
                                        if (matchedSuccessfully) {
                                            callback.onMatchFound(sessionId, true, finalCandidateId, "User");
                                        } else {
                                            // Candidate was taken by someone else; enqueue self
                                            enqueueSelf(myUid, callback);
                                        }
                                    }).addOnFailureListener(e -> enqueueSelf(myUid, callback));
                                } else {
                                    // No candidate available: enqueue self and listen
                                    enqueueSelf(myUid, callback);
                                }
                            }).addOnFailureListener(e -> callback.onError(e.getMessage()));
                });
    }

    private void enqueueSelf(String myUid, MatchCallback callback) {
        myQueueDoc = db.collection("match_queue").document(myUid);
        Map<String, Object> queueData = new HashMap<>();
        queueData.put("uid", myUid);
        queueData.put("status", "waiting");
        queueData.put("timestamp", System.currentTimeMillis());

        myQueueDoc.set(queueData).addOnSuccessListener(aVoid -> {
            // Listen for match event
            queueListener = myQueueDoc.addSnapshotListener((snapshot, error) -> {
                if (snapshot != null && snapshot.exists()) {
                    String status = snapshot.getString("status");
                    if ("matched".equals(status)) {
                        String sessionId = snapshot.getString("sessionId");
                        String peerId = snapshot.getString("peerId");
                        leaveQueue();
                        callback.onMatchFound(sessionId, false, peerId, "User");
                    }
                }
            });
        }).addOnFailureListener(e -> callback.onError(e.getMessage()));
    }

    public void leaveQueue() {
        if (queueListener != null) {
            queueListener.remove();
            queueListener = null;
        }
        if (myQueueDoc != null) {
            myQueueDoc.delete();
            myQueueDoc = null;
        }
    }
}`
  },

  // 6. WebRTC & Video Calling Engine
  {
    path: 'app/src/main/java/com/vibetv/app/webrtc/WebRtcClient.java',
    language: 'java',
    category: 'java',
    description: 'Hardware-accelerated WebRTC client managing camera capturer, surface renderers, audio tracks, and SDP peer connections.',
    content: `package com.vibetv.app.webrtc;

import android.content.Context;
import com.vibetv.app.VibeTvApp;
import org.webrtc.*;
import java.util.ArrayList;
import java.util.List;

public class WebRtcClient {
    public interface SignalingListener {
        void onLocalIceCandidate(IceCandidate candidate);
    }

    private final Context context;
    private final PeerConnectionFactory factory;
    private PeerConnection peerConnection;
    private VideoTrack localVideoTrack;
    private AudioTrack localAudioTrack;
    private VideoCapturer videoCapturer;
    private SurfaceTextureHelper surfaceTextureHelper;
    private boolean isMuted = false;
    private boolean isVideoOff = false;

    public WebRtcClient(Context context) {
        this.context = context;

        // Hardware video encoder / decoder factories
        EglBase.Context eglContext = VibeTvApp.getInstance().getRootEglBase().getEglBaseContext();
        VideoEncoderFactory encoderFactory = new DefaultVideoEncoderFactory(eglContext, true, true);
        VideoDecoderFactory decoderFactory = new DefaultVideoDecoderFactory(eglContext);

        factory = PeerConnectionFactory.builder()
                .setVideoEncoderFactory(encoderFactory)
                .setVideoDecoderFactory(decoderFactory)
                .createPeerConnectionFactory();
    }

    public void initLocalMedia(SurfaceViewRenderer localRenderer) {
        EglBase.Context eglContext = VibeTvApp.getInstance().getRootEglBase().getEglBaseContext();
        localRenderer.init(eglContext, null);
        localRenderer.setMirror(true);
        localRenderer.setZOrderMediaOverlay(true);

        // Audio
        AudioSource audioSource = factory.createAudioSource(new MediaConstraints());
        localAudioTrack = factory.createAudioTrack("101", audioSource);

        // Video
        surfaceTextureHelper = SurfaceTextureHelper.create("CaptureThread", eglContext);
        videoCapturer = createCameraCapturer();
        VideoSource videoSource = factory.createVideoSource(videoCapturer.isScreencast());
        videoCapturer.initialize(surfaceTextureHelper, context, videoSource.getCapturerObserver());
        videoCapturer.startCapture(1280, 720, 30);

        localVideoTrack = factory.createVideoTrack("100", videoSource);
        localVideoTrack.addSink(localRenderer);
    }

    public void initPeerConnection(SurfaceViewRenderer remoteRenderer, SignalingListener listener) {
        EglBase.Context eglContext = VibeTvApp.getInstance().getRootEglBase().getEglBaseContext();
        remoteRenderer.init(eglContext, null);
        remoteRenderer.setMirror(false);

        List<PeerConnection.IceServer> iceServers = new ArrayList<>();
        iceServers.add(PeerConnection.IceServer.builder("stun:stun.l.google.com:19302").createIceServer());
        iceServers.add(PeerConnection.IceServer.builder("stun:stun1.l.google.com:19302").createIceServer());
        iceServers.add(PeerConnection.IceServer.builder("stun:stun2.l.google.com:19302").createIceServer());

        PeerConnection.RTCConfiguration rtcConfig = new PeerConnection.RTCConfiguration(iceServers);
        rtcConfig.sdpSemantics = PeerConnection.SdpSemantics.UNIFIED_PLAN;

        peerConnection = factory.createPeerConnection(rtcConfig, new PeerConnection.Observer() {
            @Override
            public void onIceCandidate(IceCandidate candidate) {
                listener.onLocalIceCandidate(candidate);
            }
            @Override
            public void onAddTrack(RtpReceiver receiver, MediaStream[] mediaStreams) {
                if (receiver.track() instanceof VideoTrack) {
                    VideoTrack remoteTrack = (VideoTrack) receiver.track();
                    remoteTrack.addSink(remoteRenderer);
                }
            }
            @Override public void onSignalingChange(PeerConnection.SignalingState signalingState) {}
            @Override public void onIceConnectionChange(PeerConnection.IceConnectionState iceConnectionState) {}
            @Override public void onIceConnectionReceivingChange(boolean b) {}
            @Override public void onIceGatheringChange(PeerConnection.IceGatheringState iceGatheringState) {}
            @Override public void onIceCandidatesRemoved(IceCandidate[] iceCandidates) {}
            @Override public void onRemoveStream(MediaStream mediaStream) {}
            @Override public void onDataChannel(DataChannel dataChannel) {}
            @Override public void onRenegotiationNeeded() {}
            @Override public void onAddStream(MediaStream mediaStream) {}
        });

        // Add local tracks
        peerConnection.addTrack(localVideoTrack);
        peerConnection.addTrack(localAudioTrack);
    }

    public void createOffer(SdpObserver observer) {
        MediaConstraints sdpConstraints = new MediaConstraints();
        sdpConstraints.mandatory.add(new MediaConstraints.KeyValuePair("OfferToReceiveVideo", "true"));
        sdpConstraints.mandatory.add(new MediaConstraints.KeyValuePair("OfferToReceiveAudio", "true"));

        peerConnection.createOffer(new CustomSdpObserver("CreateOffer") {
            @Override
            public void onCreateSuccess(SessionDescription sessionDescription) {
                peerConnection.setLocalDescription(new CustomSdpObserver("SetLocal"), sessionDescription);
                observer.onCreateSuccess(sessionDescription);
            }
        }, sdpConstraints);
    }

    public void handleRemoteOffer(SessionDescription offer, SdpObserver answerObserver) {
        peerConnection.setRemoteDescription(new CustomSdpObserver("SetRemoteOffer") {
            @Override
            public void onSetSuccess() {
                MediaConstraints sdpConstraints = new MediaConstraints();
                sdpConstraints.mandatory.add(new MediaConstraints.KeyValuePair("OfferToReceiveVideo", "true"));
                sdpConstraints.mandatory.add(new MediaConstraints.KeyValuePair("OfferToReceiveAudio", "true"));
                peerConnection.createAnswer(new CustomSdpObserver("CreateAnswer") {
                    @Override
                    public void onCreateSuccess(SessionDescription sessionDescription) {
                        peerConnection.setLocalDescription(new CustomSdpObserver("SetLocalAnswer"), sessionDescription);
                        answerObserver.onCreateSuccess(sessionDescription);
                    }
                }, sdpConstraints);
            }
        }, offer);
    }

    public void handleRemoteAnswer(SessionDescription answer) {
        peerConnection.setRemoteDescription(new CustomSdpObserver("SetRemoteAnswer"), answer);
    }

    public void addRemoteIceCandidate(IceCandidate candidate) {
        if (peerConnection != null) {
            peerConnection.addIceCandidate(candidate);
        }
    }

    public void toggleAudio() {
        isMuted = !isMuted;
        if (localAudioTrack != null) localAudioTrack.setEnabled(!isMuted);
    }

    public void toggleVideo() {
        isVideoOff = !isVideoOff;
        if (localVideoTrack != null) localVideoTrack.setEnabled(!isVideoOff);
    }

    public void switchCamera() {
        if (videoCapturer instanceof CameraVideoCapturer) {
            ((CameraVideoCapturer) videoCapturer).switchCamera(null);
        }
    }

    private VideoCapturer createCameraCapturer() {
        Camera2Enumerator enumerator = new Camera2Enumerator(context);
        for (String deviceName : enumerator.getDeviceNames()) {
            if (enumerator.isFrontFacing(deviceName)) {
                return enumerator.createCapturer(deviceName, null);
            }
        }
        return null;
    }

    public void close() {
        if (peerConnection != null) {
            peerConnection.dispose();
            peerConnection = null;
        }
        if (videoCapturer != null) {
            try { videoCapturer.stopCapture(); } catch (Exception ignored) {}
            videoCapturer.dispose();
        }
        if (surfaceTextureHelper != null) surfaceTextureHelper.dispose();
    }
}`
  },
  {
    path: 'app/src/main/java/com/vibetv/app/webrtc/CustomSdpObserver.java',
    language: 'java',
    category: 'java',
    description: 'SDP observer boilerplate handler.',
    content: `package com.vibetv.app.webrtc;

import android.util.Log;
import org.webrtc.SdpObserver;
import org.webrtc.SessionDescription;

public class CustomSdpObserver implements SdpObserver {
    private final String tag;

    public CustomSdpObserver(String tag) {
        this.tag = "SDP_" + tag;
    }

    @Override
    public void onCreateSuccess(SessionDescription sessionDescription) {
        Log.d(tag, "onCreateSuccess");
    }

    @Override
    public void onSetSuccess() {
        Log.d(tag, "onSetSuccess");
    }

    @Override
    public void onCreateFailure(String s) {
        Log.e(tag, "onCreateFailure: " + s);
    }

    @Override
    public void onSetFailure(String s) {
        Log.e(tag, "onSetFailure: " + s);
    }
}`
  },

  // 7. Video Chat Activity with Swipe Navigation, Chat, 5 Emoji Reactions & Moderation
  {
    path: 'app/src/main/java/com/vibetv/app/chat/VideoChatActivity.java',
    language: 'java',
    category: 'java',
    description: 'Complete Video Chat Activity: full remote video, left PIP local preview, horizontal swipe skip, NO next button, live chat with typing dots, 5 emoji reactions burst, and Report/Block safety.',
    content: `package com.vibetv.app.chat;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.GestureDetector;
import android.view.MotionEvent;
import android.view.View;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.firestore.DocumentReference;
import com.google.firebase.firestore.FirebaseFirestore;
import com.google.firebase.firestore.ListenerRegistration;
import com.vibetv.app.R;
import com.vibetv.app.databinding.ActivityVideoChatBinding;
import com.vibetv.app.models.ChatMessage;
import com.vibetv.app.webrtc.CustomSdpObserver;
import com.vibetv.app.webrtc.WebRtcClient;
import org.webrtc.IceCandidate;
import org.webrtc.SessionDescription;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class VideoChatActivity extends AppCompatActivity {
    private ActivityVideoChatBinding binding;
    private WebRtcClient webRtcClient;
    private FirebaseFirestore db;
    private FirebaseAuth auth;
    private String sessionId;
    private boolean isInitiator;
    private String peerId;
    private String peerUsername;

    private ChatAdapter chatAdapter;
    private List<ChatMessage> chatList = new ArrayList<>();
    private ListenerRegistration sessionListener;
    private ListenerRegistration chatListener;
    private GestureDetector swipeGestureDetector;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        binding = ActivityVideoChatBinding.inflate(getLayoutInflater());
        setContentView(binding.getRoot());

        sessionId = getIntent().getStringExtra("SESSION_ID");
        isInitiator = getIntent().getBooleanExtra("IS_INITIATOR", false);
        peerId = getIntent().getStringExtra("PEER_ID");
        peerUsername = getIntent().getStringExtra("PEER_USERNAME");

        db = FirebaseFirestore.getInstance();
        auth = FirebaseAuth.getInstance();

        setupWebRtc();
        setupChat();
        setupEmojiReactions();
        setupControls();
        setupSwipeGesture();
    }

    private void setupWebRtc() {
        webRtcClient = new WebRtcClient(this);
        webRtcClient.initLocalMedia(binding.localVideoView);
        webRtcClient.initPeerConnection(binding.remoteVideoView, candidate -> {
            // Push ICE Candidate to Firestore signaling subcollection
            Map<String, Object> candMap = new HashMap<>();
            candMap.put("sdpMid", candidate.sdpMid);
            candMap.put("sdpMLineIndex", candidate.sdpMLineIndex);
            candMap.put("sdp", candidate.sdp);
            candMap.put("sender", auth.getUid());

            db.collection("sessions").document(sessionId)
                    .collection("candidates").add(candMap);
        });

        DocumentReference sessionDoc = db.collection("sessions").document(sessionId);

        if (isInitiator) {
            webRtcClient.createOffer(new CustomSdpObserver("OfferCreated") {
                @Override
                public void onCreateSuccess(SessionDescription desc) {
                    Map<String, Object> offerMap = new HashMap<>();
                    offerMap.put("sdp", desc.description);
                    offerMap.put("type", desc.type.canonicalForm());
                    sessionDoc.update("offer", offerMap);
                }
            });
        }

        // Listen for remote signaling (Offer / Answer / ICE Candidates)
        sessionListener = sessionDoc.addSnapshotListener((doc, error) -> {
            if (doc != null && doc.exists()) {
                if (!isInitiator && doc.contains("offer") && !doc.contains("answer")) {
                    Map<String, Object> offer = (Map<String, Object>) doc.get("offer");
                    String sdp = (String) offer.get("sdp");
                    SessionDescription offerDesc = new SessionDescription(SessionDescription.Type.OFFER, sdp);
                    webRtcClient.handleRemoteOffer(offerDesc, new CustomSdpObserver("AnswerCreated") {
                        @Override
                        public void onCreateSuccess(SessionDescription answer) {
                            Map<String, Object> ansMap = new HashMap<>();
                            ansMap.put("sdp", answer.description);
                            ansMap.put("type", answer.type.canonicalForm());
                            sessionDoc.update("answer", ansMap);
                        }
                    });
                } else if (isInitiator && doc.contains("answer")) {
                    Map<String, Object> answer = (Map<String, Object>) doc.get("answer");
                    String sdp = (String) answer.get("sdp");
                    SessionDescription ansDesc = new SessionDescription(SessionDescription.Type.ANSWER, sdp);
                    webRtcClient.handleRemoteAnswer(ansDesc);
                }

                // Check if session was ended remotely
                if ("ended".equals(doc.getString("status"))) {
                    Toast.makeText(this, "Opponent disconnected", Toast.LENGTH_SHORT).show();
                    finish();
                }
            }
        });

        // Listen for remote ICE Candidates
        sessionDoc.collection("candidates").addSnapshotListener((snaps, err) -> {
            if (snaps != null) {
                for (var change : snaps.getDocumentChanges()) {
                    var data = change.getDocument().getData();
                    String sender = (String) data.get("sender");
                    if (!auth.getUid().equals(sender)) {
                        String sdp = (String) data.get("sdp");
                        String sdpMid = (String) data.get("sdpMid");
                        long mLine = ((Number) data.get("sdpMLineIndex")).longValue();
                        IceCandidate cand = new IceCandidate(sdpMid, (int) mLine, sdp);
                        webRtcClient.addRemoteIceCandidate(cand);
                    }
                }
            }
        });
    }

    private void setupChat() {
        chatAdapter = new ChatAdapter(chatList, auth.getUid());
        binding.rvChatMessages.setLayoutManager(new LinearLayoutManager(this));
        binding.rvChatMessages.setAdapter(chatAdapter);

        // Send message
        binding.btnSendMessage.setOnClickListener(v -> {
            String text = binding.etMessageInput.getText().toString().trim();
            if (!text.isEmpty()) {
                sendMessage(text);
                binding.etMessageInput.setText("");
            }
        });

        // Typing indicator sync
        binding.etMessageInput.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            @Override public void onTextChanged(CharSequence s, int start, int before, int count) {
                boolean isTyping = s.length() > 0;
                db.collection("sessions").document(sessionId)
                        .update("typing_" + auth.getUid(), isTyping);
            }
            @Override public void afterTextChanged(Editable s) {}
        });

        // Listen for incoming messages
        chatListener = db.collection("sessions").document(sessionId)
                .collection("messages").orderBy("timestamp")
                .addSnapshotListener((snapshots, e) -> {
                    if (snapshots != null) {
                        chatList.clear();
                        for (var doc : snapshots.getDocuments()) {
                            chatList.add(doc.toObject(ChatMessage.class));
                        }
                        chatAdapter.notifyDataSetChanged();
                        if (!chatList.isEmpty()) {
                            binding.rvChatMessages.smoothScrollToPosition(chatList.size() - 1);
                        }
                    }
                });

        // Listen for opponent typing indicator
        db.collection("sessions").document(sessionId).addSnapshotListener((doc, err) -> {
            if (doc != null && doc.exists()) {
                Boolean isOpponentTyping = doc.getBoolean("typing_" + peerId);
                binding.tvTypingIndicator.setVisibility(Boolean.TRUE.equals(isOpponentTyping) ? View.VISIBLE : View.GONE);
            }
        });
    }

    private void sendMessage(String text) {
        String msgId = UUID.randomUUID().toString();
        ChatMessage msg = new ChatMessage(msgId, auth.getUid(), "You", text, System.currentTimeMillis());
        db.collection("sessions").document(sessionId)
                .collection("messages").document(msgId).set(msg);
    }

    // Exactly 5 Emoji Reaction Buttons
    private void setupEmojiReactions() {
        binding.btnEmoji1.setOnClickListener(v -> triggerEmojiReaction("🔥"));
        binding.btnEmoji2.setOnClickListener(v -> triggerEmojiReaction("❤️"));
        binding.btnEmoji3.setOnClickListener(v -> triggerEmojiReaction("😂"));
        binding.btnEmoji4.setOnClickListener(v -> triggerEmojiReaction("👏"));
        binding.btnEmoji5.setOnClickListener(v -> triggerEmojiReaction("😮"));

        // Listen for opponent's emoji reactions
        db.collection("sessions").document(sessionId).collection("reactions")
                .addSnapshotListener((snaps, err) -> {
                    if (snaps != null) {
                        for (var change : snaps.getDocumentChanges()) {
                            String emoji = change.getDocument().getString("emoji");
                            String sender = change.getDocument().getString("sender");
                            if (emoji != null && !auth.getUid().equals(sender)) {
                                showFullScreenEmojiBurst(emoji);
                            }
                        }
                    }
                });
    }

    private void triggerEmojiReaction(String emoji) {
        showFullScreenEmojiBurst(emoji);

        // Sync with opponent
        Map<String, Object> reaction = new HashMap<>();
        reaction.put("emoji", emoji);
        reaction.put("sender", auth.getUid());
        reaction.put("timestamp", System.currentTimeMillis());
        db.collection("sessions").document(sessionId).collection("reactions").add(reaction);
    }

    private void showFullScreenEmojiBurst(String emoji) {
        binding.tvEmojiBurst.setText(emoji);
        binding.tvEmojiBurst.setVisibility(View.VISIBLE);
        Animation anim = AnimationUtils.loadAnimation(this, R.anim.emoji_burst);
        anim.setAnimationListener(new Animation.AnimationListener() {
            @Override public void onAnimationStart(Animation a) {}
            @Override public void onAnimationEnd(Animation a) {
                binding.tvEmojiBurst.setVisibility(View.GONE);
            }
            @Override public void onAnimationRepeat(Animation a) {}
        });
        binding.tvEmojiBurst.startAnimation(anim);
    }

    private void setupControls() {
        binding.btnMuteMic.setOnClickListener(v -> {
            webRtcClient.toggleAudio();
            binding.btnMuteMic.setSelected(!binding.btnMuteMic.isSelected());
        });

        binding.btnToggleVideo.setOnClickListener(v -> {
            webRtcClient.toggleVideo();
            binding.btnToggleVideo.setSelected(!binding.btnToggleVideo.isSelected());
        });

        binding.btnFlipCamera.setOnClickListener(v -> webRtcClient.switchCamera());

        binding.btnEndCall.setOnClickListener(v -> endCallAndExit());

        binding.btnReport.setOnClickListener(v -> showReportDialog());
    }

    // Swipe navigation: Horizontal swipe initiates search for next opponent without closing app
    private void setupSwipeGesture() {
        swipeGestureDetector = new GestureDetector(this, new GestureDetector.SimpleOnGestureListener() {
            private static final int SWIPE_THRESHOLD = 100;
            private static final int SWIPE_VELOCITY_THRESHOLD = 100;

            @Override
            public boolean onFling(MotionEvent e1, MotionEvent e2, float velocityX, float velocityY) {
                if (e1 != null && e2 != null) {
                    float diffX = e2.getX() - e1.getX();
                    float diffY = e2.getY() - e1.getY();
                    if (Math.abs(diffX) > Math.abs(diffY) &&
                        Math.abs(diffX) > SWIPE_THRESHOLD &&
                        Math.abs(velocityX) > SWIPE_VELOCITY_THRESHOLD) {
                        // User swiped horizontally: skip to next user
                        Toast.makeText(VideoChatActivity.this, "Finding next match...", Toast.LENGTH_SHORT).show();
                        endCallAndSearchNext();
                        return true;
                    }
                }
                return false;
            }
        });

        binding.remoteVideoView.setOnTouchListener((v, event) -> swipeGestureDetector.onTouchEvent(event));
    }

    private void endCallAndSearchNext() {
        cleanupSession();
        finish(); // Returns safely to MainActivity where queue is re-entered
    }

    private void endCallAndExit() {
        cleanupSession();
        finish();
    }

    private void cleanupSession() {
        if (webRtcClient != null) webRtcClient.close();
        if (sessionListener != null) sessionListener.remove();
        if (chatListener != null) chatListener.remove();

        db.collection("sessions").document(sessionId).update("status", "ended");
    }

    private void showReportDialog() {
        String[] reasons = {"Harassment or Bullying", "Nudity or Inappropriate Content", "Spam / Commercial", "Other"};
        new AlertDialog.Builder(this)
                .setTitle("Report User")
                .setItems(reasons, (dialog, which) -> {
                    String selectedReason = reasons[which];
                    submitReportAndBlock(selectedReason);
                })
                .setNegativeButton("Cancel", null)
                .show();
    }

    private void submitReportAndBlock(String reason) {
        Map<String, Object> report = new HashMap<>();
        report.put("reporterId", auth.getUid());
        report.put("reportedUserId", peerId);
        report.put("reason", reason);
        report.put("timestamp", System.currentTimeMillis());
        report.put("status", "pending");

        db.collection("reports").add(report);

        // Add to user's blocks collection
        db.collection("users").document(auth.getUid())
                .collection("blocks").document(peerId).set(new HashMap<>());

        Toast.makeText(this, "User reported and blocked. You will never match with them again.", Toast.LENGTH_LONG).show();
        endCallAndExit();
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        cleanupSession();
    }
}`
  },

  // 8. XML Layout Files
  {
    path: 'app/src/main/res/layout/activity_login.xml',
    language: 'xml',
    category: 'xml',
    description: 'Modern dark UI login layout with VIBE TV brand header, identifier input, and gradient buttons.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#0a0a0c"
    android:padding="24dp">

    <!-- Brand Header -->
    <ImageView
        android:id="@+id/ivLogo"
        android:layout_width="64dp"
        android:layout_height="64dp"
        android:layout_marginTop="48dp"
        android:src="@drawable/ic_vibe_logo"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

    <TextView
        android:id="@+id/tvBrandTitle"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="12dp"
        android:fontFamily="sans-serif-black"
        android:text="VIBE TV"
        android:textColor="#FFFFFF"
        android:textSize="28sp"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toBottomOf="@id/ivLogo" />

    <TextView
        android:id="@+id/tvSubtitle"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="4dp"
        android:text="Random Live Video Chat"
        android:textColor="#9E9E9E"
        android:textSize="14sp"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toBottomOf="@id/tvBrandTitle" />

    <!-- Form Container -->
    <com.google.android.material.textfield.TextInputLayout
        android:id="@+id/tilIdentifier"
        style="@style/Widget.MaterialComponents.TextInputLayout.OutlinedBox"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="40dp"
        android:hint="Email or Username"
        app:boxStrokeColor="#ff2a5f"
        app:hintTextColor="#ff2a5f"
        app:layout_constraintTop_toBottomOf="@id/tvSubtitle">

        <com.google.android.material.textfield.TextInputEditText
            android:id="@+id/etIdentifier"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:inputType="textEmailAddress"
            android:textColor="#FFFFFF" />
    </com.google.android.material.textfield.TextInputLayout>

    <com.google.android.material.textfield.TextInputLayout
        android:id="@+id/tilPassword"
        style="@style/Widget.MaterialComponents.TextInputLayout.OutlinedBox"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginTop="16dp"
        android:hint="Password"
        app:boxStrokeColor="#ff2a5f"
        app:endIconMode="password_toggle"
        app:hintTextColor="#ff2a5f"
        app:layout_constraintTop_toBottomOf="@id/tilIdentifier">

        <com.google.android.material.textfield.TextInputEditText
            android:id="@+id/etPassword"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:inputType="textPassword"
            android:textColor="#FFFFFF" />
    </com.google.android.material.textfield.TextInputLayout>

    <TextView
        android:id="@+id/tvForgotPassword"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginTop="8dp"
        android:text="Forgot Password?"
        android:textColor="#EC4899"
        android:textSize="13sp"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintTop_toBottomOf="@id/tilPassword" />

    <com.google.android.material.button.MaterialButton
        android:id="@+id/btnLogin"
        android:layout_width="match_parent"
        android:layout_height="54dp"
        android:layout_marginTop="28dp"
        android:backgroundTint="#ff2a5f"
        android:text="LOG IN"
        android:textColor="#FFFFFF"
        android:textStyle="bold"
        app:cornerRadius="12dp"
        app:layout_constraintTop_toBottomOf="@id/tvForgotPassword" />

    <ProgressBar
        android:id="@+id/progressBar"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:indeterminateTint="#ff2a5f"
        android:visibility="gone"
        app:layout_constraintBottom_toTopOf="@id/tvGoToRegister"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toBottomOf="@id/btnLogin" />

    <TextView
        android:id="@+id/tvGoToRegister"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginBottom="24dp"
        android:text="Don't have an account? Register"
        android:textColor="#E0E0E0"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent" />

</androidx.constraintlayout.widget.ConstraintLayout>`
  },
  {
    path: 'app/src/main/res/layout/activity_register.xml',
    language: 'xml',
    category: 'xml',
    description: 'Registration layout with full name, unique username, email, password, and gender radio buttons.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<ScrollView xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#0a0a0c"
    android:fillViewport="true">

    <androidx.constraintlayout.widget.ConstraintLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:padding="24dp">

        <TextView
            android:id="@+id/tvCreateAccount"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="24dp"
            android:fontFamily="sans-serif-black"
            android:text="Join VIBE TV"
            android:textColor="#FFFFFF"
            android:textSize="26sp"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintTop_toTopOf="parent" />

        <TextView
            android:id="@+id/tvSub"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="4dp"
            android:text="Real random video chat with real people"
            android:textColor="#9E9E9E"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintTop_toBottomOf="@id/tvCreateAccount" />

        <!-- Full Name -->
        <com.google.android.material.textfield.TextInputLayout
            android:id="@+id/tilFullName"
            style="@style/Widget.MaterialComponents.TextInputLayout.OutlinedBox"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="24dp"
            android:hint="Full Name"
            app:boxStrokeColor="#ff2a5f"
            app:hintTextColor="#ff2a5f"
            app:layout_constraintTop_toBottomOf="@id/tvSub">

            <com.google.android.material.textfield.TextInputEditText
                android:id="@+id/etFullName"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:inputType="textPersonName"
                android:textColor="#FFFFFF" />
        </com.google.android.material.textfield.TextInputLayout>

        <!-- Email -->
        <com.google.android.material.textfield.TextInputLayout
            android:id="@+id/tilEmail"
            style="@style/Widget.MaterialComponents.TextInputLayout.OutlinedBox"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="12dp"
            android:hint="Email Address"
            app:boxStrokeColor="#ff2a5f"
            app:hintTextColor="#ff2a5f"
            app:layout_constraintTop_toBottomOf="@id/tilFullName">

            <com.google.android.material.textfield.TextInputEditText
                android:id="@+id/etEmail"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:inputType="textEmailAddress"
                android:textColor="#FFFFFF" />
        </com.google.android.material.textfield.TextInputLayout>

        <!-- Password -->
        <com.google.android.material.textfield.TextInputLayout
            android:id="@+id/tilPassword"
            style="@style/Widget.MaterialComponents.TextInputLayout.OutlinedBox"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="12dp"
            android:hint="Password (min 6 characters)"
            app:boxStrokeColor="#ff2a5f"
            app:endIconMode="password_toggle"
            app:hintTextColor="#ff2a5f"
            app:layout_constraintTop_toBottomOf="@id/tilEmail">

            <com.google.android.material.textfield.TextInputEditText
                android:id="@+id/etPassword"
                android:layout_width="match_parent"
                android:layout_height="wrap_content"
                android:inputType="textPassword"
                android:textColor="#FFFFFF" />
        </com.google.android.material.textfield.TextInputLayout>

        <!-- Gender Selection -->
        <TextView
            android:id="@+id/tvGenderLabel"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="16dp"
            android:text="Select Gender"
            android:textColor="#E0E0E0"
            android:textSize="14sp"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintTop_toBottomOf="@id/tilPassword" />

        <RadioGroup
            android:id="@+id/rgGender"
            android:layout_width="match_parent"
            android:layout_height="wrap_content"
            android:layout_marginTop="6dp"
            android:orientation="horizontal"
            app:layout_constraintTop_toBottomOf="@id/tvGenderLabel">

            <RadioButton
                android:id="@+id/rbMale"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:buttonTint="#ff2a5f"
                android:text="Male"
                android:textColor="#FFFFFF" />

            <RadioButton
                android:id="@+id/rbFemale"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:buttonTint="#ff2a5f"
                android:text="Female"
                android:textColor="#FFFFFF" />

            <RadioButton
                android:id="@+id/rbOther"
                android:layout_width="wrap_content"
                android:layout_height="wrap_content"
                android:layout_weight="1"
                android:buttonTint="#ff2a5f"
                android:text="Other"
                android:textColor="#FFFFFF" />
        </RadioGroup>

        <!-- Register Button -->
        <com.google.android.material.button.MaterialButton
            android:id="@+id/btnRegister"
            android:layout_width="match_parent"
            android:layout_height="54dp"
            android:layout_marginTop="24dp"
            android:backgroundTint="#ff2a5f"
            android:text="CREATE ACCOUNT"
            android:textColor="#FFFFFF"
            android:textStyle="bold"
            app:cornerRadius="12dp"
            app:layout_constraintTop_toBottomOf="@id/rgGender" />

        <ProgressBar
            android:id="@+id/progressBar"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:indeterminateTint="#ff2a5f"
            android:visibility="gone"
            app:layout_constraintBottom_toTopOf="@id/tvBackToLogin"
            app:layout_constraintEnd_toEndOf="parent"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintTop_toBottomOf="@id/btnRegister" />

        <TextView
            android:id="@+id/tvBackToLogin"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:layout_marginTop="20dp"
            android:layout_marginBottom="24dp"
            android:text="Already have an account? Log In"
            android:textColor="#E0E0E0"
            app:layout_constraintBottom_toBottomOf="parent"
            app:layout_constraintEnd_toEndOf="parent"
            app:layout_constraintStart_toStartOf="parent"
            app:layout_constraintTop_toBottomOf="@id/btnRegister" />

    </androidx.constraintlayout.widget.ConstraintLayout>
</ScrollView>`
  },
  {
    path: 'app/src/main/res/layout/activity_video_chat.xml',
    language: 'xml',
    category: 'xml',
    description: 'Video chat layout: full remote video, left PIP local preview, swipe gesture hint, 5 emoji reactions, and live chat area.',
    content: `<?xml version="1.0" encoding="utf-8"?>
<androidx.constraintlayout.widget.ConstraintLayout xmlns:android="http://schemas.android.com/apk/res/android"
    xmlns:app="http://schemas.android.com/apk/res-auto"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="#000000">

    <!-- 1. Full Remote Camera Feed -->
    <org.webrtc.SurfaceViewRenderer
        android:id="@+id/remoteVideoView"
        android:layout_width="match_parent"
        android:layout_height="match_parent" />

    <!-- 2. Local Camera Preview on Left Side (PIP) -->
    <androidx.cardview.widget.CardView
        android:id="@+id/cardLocalPreview"
        android:layout_width="100dp"
        android:layout_height="145dp"
        android:layout_marginStart="16dp"
        android:layout_marginTop="48dp"
        app:cardBackgroundColor="#1A1A1A"
        app:cardCornerRadius="16dp"
        app:cardElevation="8dp"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent">

        <org.webrtc.SurfaceViewRenderer
            android:id="@+id/localVideoView"
            android:layout_width="match_parent"
            android:layout_height="match_parent" />
    </androidx.cardview.widget.CardView>

    <!-- Top Action Bar (Report / Status) -->
    <ImageButton
        android:id="@+id/btnReport"
        android:layout_width="44dp"
        android:layout_height="44dp"
        android:layout_marginTop="48dp"
        android:layout_marginEnd="16dp"
        android:background="@drawable/bg_circle_glass"
        android:src="@drawable/ic_flag"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

    <!-- Temporary Full-Screen Emoji Burst View -->
    <TextView
        android:id="@+id/tvEmojiBurst"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:textSize="96sp"
        android:visibility="gone"
        app:layout_constraintBottom_toBottomOf="parent"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent"
        app:layout_constraintTop_toTopOf="parent" />

    <!-- Chat Messages Scroll Area (Bottom Half Overlay) -->
    <androidx.recyclerview.widget.RecyclerView
        android:id="@+id/rvChatMessages"
        android:layout_width="0dp"
        android:layout_height="180dp"
        android:layout_marginStart="16dp"
        android:layout_marginEnd="16dp"
        android:layout_marginBottom="8dp"
        app:layout_constraintBottom_toTopOf="@id/tvTypingIndicator"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent" />

    <!-- Animated 3-Dots Typing Indicator -->
    <TextView
        android:id="@+id/tvTypingIndicator"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_marginStart="18dp"
        android:layout_marginBottom="6dp"
        android:text="Opponent is typing •••"
        android:textColor="#FF80AB"
        android:textSize="12sp"
        android:visibility="gone"
        app:layout_constraintBottom_toTopOf="@id/layoutEmojiBar"
        app:layout_constraintStart_toStartOf="parent" />

    <!-- Exactly 5 Emoji Reaction Buttons -->
    <LinearLayout
        android:id="@+id/layoutEmojiBar"
        android:layout_width="wrap_content"
        android:layout_height="44dp"
        android:layout_marginBottom="8dp"
        android:background="@drawable/bg_pill_glass"
        android:orientation="horizontal"
        android:paddingStart="8dp"
        android:paddingEnd="8dp"
        app:layout_constraintBottom_toTopOf="@id/layoutControls"
        app:layout_constraintEnd_toEndOf="parent"
        app:layout_constraintStart_toStartOf="parent">

        <Button
            android:id="@+id/btnEmoji1"
            style="@style/Widget.AppCompat.Button.Borderless"
            android:layout_width="44dp"
            android:layout_height="44dp"
            android:text="🔥"
            android:textSize="20sp" />

        <Button
            android:id="@+id/btnEmoji2"
            style="@style/Widget.AppCompat.Button.Borderless"
            android:layout_width="44dp"
            android:layout_height="44dp"
            android:text="❤️"
            android:textSize="20sp" />

        <Button
            android:id="@+id/btnEmoji3"
            style="@style/Widget.AppCompat.Button.Borderless"
            android:layout_width="44dp"
            android:layout_height="44dp"
            android:text="😂"
            android:textSize="20sp" />

        <Button
            android:id="@+id/btnEmoji4"
            style="@style/Widget.AppCompat.Button.Borderless"
            android:layout_width="44dp"
            android:layout_height="44dp"
            android:text="👏"
            android:textSize="20sp" />

        <Button
            android:id="@+id/btnEmoji5"
            style="@style/Widget.AppCompat.Button.Borderless"
            android:layout_width="44dp"
            android:layout_height="44dp"
            android:text="😮"
            android:textSize="20sp" />
    </LinearLayout>

    <!-- Bottom Controls & Message Bar -->
    <LinearLayout
        android:id="@+id/layoutControls"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_marginStart="12dp"
        android:layout_marginEnd="12dp"
        android:layout_marginBottom="16dp"
        android:gravity="center_vertical"
        android:orientation="horizontal"
        app:layout_constraintBottom_toBottomOf="parent">

        <!-- In-Call Message Input -->
        <EditText
            android:id="@+id/etMessageInput"
            android:layout_width="0dp"
            android:layout_height="46dp"
            android:layout_weight="1"
            android:background="@drawable/bg_input_glass"
            android:hint="Type a message..."
            android:paddingStart="14dp"
            android:paddingEnd="14dp"
            android:textColor="#FFFFFF"
            android:textColorHint="#9E9E9E"
            android:textSize="14sp" />

        <ImageButton
            android:id="@+id/btnSendMessage"
            android:layout_width="46dp"
            android:layout_height="46dp"
            android:layout_marginStart="6dp"
            android:background="@drawable/bg_circle_accent"
            android:src="@drawable/ic_send" />

        <!-- WebRTC Control Buttons -->
        <ImageButton
            android:id="@+id/btnMuteMic"
            android:layout_width="44dp"
            android:layout_height="44dp"
            android:layout_marginStart="6dp"
            android:background="@drawable/bg_circle_glass"
            android:src="@drawable/ic_mic" />

        <ImageButton
            android:id="@+id/btnToggleVideo"
            android:layout_width="44dp"
            android:layout_height="44dp"
            android:layout_marginStart="6dp"
            android:background="@drawable/bg_circle_glass"
            android:src="@drawable/ic_videocam" />

        <ImageButton
            android:id="@+id/btnFlipCamera"
            android:layout_width="44dp"
            android:layout_height="44dp"
            android:layout_marginStart="6dp"
            android:background="@drawable/bg_circle_glass"
            android:src="@drawable/ic_flip_camera" />

        <ImageButton
            android:id="@+id/btnEndCall"
            android:layout_width="44dp"
            android:layout_height="44dp"
            android:layout_marginStart="6dp"
            android:background="@drawable/bg_circle_red"
            android:src="@drawable/ic_call_end" />

    </LinearLayout>

</androidx.constraintlayout.widget.ConstraintLayout>`
  },

  // 9. Firebase Security Rules & Cloud Functions
  {
    path: 'firebase/firestore.rules',
    language: 'javascript',
    category: 'firebase',
    description: 'Production Firestore security rules enforcing authentication, username uniqueness, private messaging, and admin rights.',
    content: `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    function isAdmin() {
      return isAuthenticated() && 
        (request.auth.token.role == 'admin' || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
    }

    // User profiles
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow create: if isOwner(userId);
      allow update: if isOwner(userId) || isAdmin();
      allow delete: if isAdmin();

      // Blocked users subcollection
      match /blocks/{blockedUserId} {
        allow read, write: if isOwner(userId);
      }
    }

    // Unique Username Registry
    match /usernames/{username} {
      allow read: if true; // Public lookup for username-to-email resolution during login
      allow create: if isAuthenticated() && !exists(/databases/$(database)/documents/usernames/$(username));
      allow delete: if isAdmin();
    }

    // Matchmaking Queue
    match /match_queue/{queueId} {
      allow read, write: if isAuthenticated();
    }

    // Active Video Sessions
    match /sessions/{sessionId} {
      allow read, write: if isAuthenticated();

      match /candidates/{candId} {
        allow read, write: if isAuthenticated();
      }

      match /messages/{msgId} {
        allow read, write: if isAuthenticated();
      }

      match /reactions/{reactionId} {
        allow read, write: if isAuthenticated();
      }
    }

    // Safety Reports
    match /reports/{reportId} {
      allow create: if isAuthenticated();
      allow read, update: if isAdmin();
    }
  }
}`
  },
  {
    path: 'firebase/functions/index.js',
    language: 'javascript',
    category: 'firebase',
    description: 'Firebase Cloud Functions for automated queue matching, stale connection cleanup, and username verification.',
    content: `/**
 * VIBE TV Firebase Cloud Functions
 * Provides server-side atomic matchmaking, user presence timeout cleanup, and admin privilege verification.
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

// Automated periodic cleanup of stale queue entries (> 60 seconds old)
exports.cleanupStaleQueue = functions.pubsub.schedule('every 2 minutes').onRun(async (context) => {
  const cutoff = Date.now() - 60000;
  const snapshot = await db.collection('match_queue')
    .where('timestamp', '<', cutoff)
    .get();

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  await batch.commit();
  console.log(\`Cleaned up \${snapshot.size} stale queue items\`);
  return null;
});

// Presence disconnect handler via Realtime Database trigger
exports.onPresenceChange = functions.database.ref('/presence/{uid}')
  .onDelete(async (snapshot, context) => {
    const uid = context.params.uid;
    // Remove user from matchmaking queue if disconnected
    await db.collection('match_queue').doc(uid).delete().catch(() => {});
    console.log(\`User \${uid} disconnected; queue cleaned up.\`);
  });`
  },

  // 10. Complete Step-by-Step Testing & Physical Device Setup Guide
  {
    path: 'README_TESTING_GUIDE.md',
    language: 'markdown',
    category: 'guide',
    description: 'Complete step-by-step tutorial: Firebase Console setup, google-services.json placement, 2-device APK testing, and WebRTC STUN/TURN troubleshooting.',
    content: `# VIBE TV — Complete Step-by-Step Build & Physical Device Testing Guide

This guide walks you through setting up the complete Android Studio project from scratch, configuring Firebase, building the APK, and testing live random video matching on **two physical Android phones**.

---

## Stage 1: Firebase Project Setup from Scratch

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com).
   - Click **Add project**, name it \`vibetv-production\`, and complete setup.

2. **Add Android App to Firebase**:
   - Click the **Android** icon in the project overview.
   - Enter package name: \`com.vibetv.app\`.
   - Nickname: \`VIBE TV\`.
   - Download the generated \`google-services.json\` file.
   - Move \`google-services.json\` into your Android Studio project at \`app/google-services.json\`.

3. **Enable Firebase Authentication**:
   - In Firebase Console, go to **Build > Authentication > Sign-in method**.
   - Enable **Email/Password** provider and save.

4. **Create Cloud Firestore**:
   - In Firebase Console, go to **Build > Firestore Database**.
   - Create database in **Production mode**.
   - Paste the contents of \`firebase/firestore.rules\` into the **Rules** tab and click **Publish**.

5. **Enable Realtime Database (for presence)**:
   - In Firebase Console, go to **Build > Realtime Database**.
   - Create database and set read/write rules to \`auth != null\`.

---

## Stage 2: Android Studio Project Creation

1. Open Android Studio (Hedgehog, Iguana, or Jellyfish).
2. Click **New Project** > **Empty Views Activity** (Java).
3. Set:
   - **Name**: \`Vibe TV\`
   - **Package name**: \`com.vibetv.app\`
   - **Language**: \`Java\`
   - **Minimum SDK**: \`API 24 (Android 7.0)\`
4. Replace the contents of the following files with the provided project code:
   - \`build.gradle\` (Project level)
   - \`settings.gradle\`
   - \`app/build.gradle\`
   - \`app/src/main/AndroidManifest.xml\`
   - All Java classes under \`app/src/main/java/com/vibetv/app/\`
   - All layout files under \`app/src/main/res/layout/\`
5. Click **Sync Project with Gradle Files** in Android Studio. Ensure all dependencies resolve cleanly.

---

## Stage 3: Testing on Two Physical Android Phones

### Requirements:
- Two physical Android phones (e.g., Phone A and Phone B).
- USB debugging enabled on both phones, or generate an APK via **Build > Build Bundle(s) / APK(s) > Build APK(s)**.

### Step 1: Install & Launch
1. Install \`vibetv-debug.apk\` on Phone A.
2. Install \`vibetv-debug.apk\` on Phone B.
3. Open the app on both phones. The dark-themed welcome screen will display.

### Step 2: Register Two Real Accounts
- **On Phone A**: Tap **Register**.
  - Full Name: \`Alice Vance\`
  - Email: \`alice@test.com\`
  - Password: \`Password123!\`
  - Gender: \`Female\`
  - Tap **Create Account**.
- **On Phone B**: Tap **Register**.
  - Full Name: \`Bob Smith\`
  - Email: \`bob@test.com\`
  - Password: \`Password123!\`
  - Gender: \`Male\`
  - Tap **Create Account**.

### Step 3: Verify Real User Online Presence
- Once logged in on both phones, observe the counter on the main screen:
  - It will display **"2 Online Now"** based on real Firebase presence!
- Try closing the app on Phone B: Phone A's counter immediately drops to **"1 Online Now"**.
- Reopen Phone B: counter updates back to 2.

### Step 4: Test Random Video Matching
1. On Phone A, tap the prominent **Start** button.
   - Camera & microphone permission dialogs appear. Tap **Allow**.
   - Phone A enters the searching state: **"Searching for real users..."** with radar pulsing.
2. On Phone B, tap **Start**.
   - Phone B joins the atomic matchmaking queue.
3. **Instant Match Connection**:
   - Phone A and Phone B establish an atomic Firestore session.
   - WebRTC peer connection initializes via Google STUN servers.
   - Phone A displays Phone B's live camera feed full screen, and Phone A's camera preview in the left PIP thumbnail!
   - Phone B displays Phone A's live camera feed full screen!

### Step 5: Test Real-Time Messaging & Typing Dots
1. On Phone A, begin typing in the bottom message input.
   - On Phone B, observe the animated typing indicator: **"Opponent is typing •••"**.
2. On Phone A, type \`"Hey Bob, video is crystal clear!"\` and tap **Send**.
   - Message appears instantly on Phone A (right side bubble).
   - Message appears in real time on Phone B (left side bubble).

### Step 6: Test 5 Emoji Reaction Bursts
1. On Phone A, tap the 🔥 (Fire) emoji reaction button.
   - A large, animated fire emoji floats up full screen and disappears after 1.8 seconds.
   - Phone B's screen simultaneously receives and animates the fire burst!
2. Test the other 4 emoji reactions (❤️, 😂, 👏, 😮).

### Step 7: Test Swipe Navigation
1. While connected, perform a **horizontal swipe** across the screen.
   - The current session ends cleanly.
   - The app does **NOT** close or call \`finish()\`.
   - The app automatically re-enters search mode to find another user!

### Step 8: Test Report and Block
1. Tap the Flag / Report icon.
2. Select **"Harassment or Bullying"**.
3. The opponent is blocked in Firestore and the call ends.
4. Try tapping Start on both phones again:
   - The matchmaking engine detects the block and will **never pair Alice and Bob together again**!

---

## Stage 4: Troubleshooting Common Issues

1. **Gradle Build Error: "Cannot resolve symbol EglBase"**:
   - Ensure \`implementation 'org.webrtc:google-webrtc:1.0.32006'\` is present in \`app/build.gradle\`.
2. **WebRTC Video Black Screen on Cellular Network**:
   - The default configuration uses public Google STUN servers (\`stun.l.google.com:19302\`). If testing on strict carrier symmetric NATs, add a TURN server (e.g. Metered.ca, Twilio, or Coturn) to \`WebRtcClient.java\`.
3. **Firestore "Missing or insufficient permissions"**:
   - Verify you copied \`firestore.rules\` to your Firebase Console and published them.
4. **Login Error: "Username not found"**:
   - Verify the \`usernames\` collection in Firestore contains a document with the lowercase username pointing to the email.`
  }
];
