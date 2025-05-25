package com.memorygym.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 웹뷰 설정 최적화
        getBridge().getWebView().getSettings().setDomStorageEnabled(true);
        getBridge().getWebView().getSettings().setDatabaseEnabled(true);
        getBridge().getWebView().getSettings().setJavaScriptEnabled(true);
        getBridge().getWebView().getSettings().setAllowFileAccess(true);
        getBridge().getWebView().getSettings().setAllowContentAccess(true);
        getBridge().getWebView().getSettings().setAllowFileAccessFromFileURLs(true);
        getBridge().getWebView().getSettings().setAllowUniversalAccessFromFileURLs(true);
        
        // 캐시 설정 (setAppCacheEnabled는 API 33+에서 제거됨)
        getBridge().getWebView().getSettings().setCacheMode(android.webkit.WebSettings.LOAD_DEFAULT);
        
        // 줌 설정
        getBridge().getWebView().getSettings().setSupportZoom(false);
        getBridge().getWebView().getSettings().setBuiltInZoomControls(false);
        getBridge().getWebView().getSettings().setDisplayZoomControls(false);
    }
} 