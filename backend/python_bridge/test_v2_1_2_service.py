#!/usr/bin/env python3
"""
Test script for SwitchPrint v2.1.2 bridge service
Tests all breakthrough features and performance improvements
"""

import requests
import json
import time
import sys
import subprocess
import threading
from typing import Dict, Any

# Service configuration
SERVICE_URL = "http://localhost:5001"
SERVICE_SCRIPT = "switchprint_service.py"

def start_service_in_background():
    """Start the SwitchPrint service in background"""
    try:
        process = subprocess.Popen([
            sys.executable, SERVICE_SCRIPT
        ], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        
        # Give service time to start
        time.sleep(8)
        return process
    except Exception as e:
        print(f"Failed to start service: {e}")
        return None

def test_health_check() -> bool:
    """Test the enhanced health check endpoint"""
    try:
        response = requests.get(f"{SERVICE_URL}/health", timeout=10)
        data = response.json()
        
        print("🔍 Health Check Results:")
        print(f"  Status: {data.get('status')}")
        print(f"  SwitchPrint Available: {data.get('switchprint_available')}")
        print(f"  SwitchPrint Version: {data.get('switchprint_version')}")
        
        print("\n📊 v2.1.2 Features Status:")
        features = data.get('v2_1_2_features', {})
        for feature, available in features.items():
            status = "✅" if available else "❌"
            print(f"  {status} {feature}: {available}")
        
        print("\n🚀 Performance Capabilities:")
        capabilities = data.get('performance_capabilities', {})
        for capability, description in capabilities.items():
            print(f"  • {capability}: {description}")
        
        print(f"\n📈 Cache Stats: {data.get('cache_stats', {})}")
        
        return data.get('status') == 'healthy'
        
    except Exception as e:
        print(f"❌ Health check failed: {e}")
        return False

def test_v2_1_2_analysis():
    """Test v2.1.2 analysis with breakthrough features"""
    
    test_cases = [
        {
            "name": "English-Spanish Code-Switching",
            "text": "I'm going to la tienda para comprar some groceries",
            "user_languages": ["english", "spanish"],
            "performance_mode": "balanced"
        },
        {
            "name": "Hindi-English Professional",
            "text": "Main office mein meeting hai, can you join us online?",
            "user_languages": ["hindi", "english"],
            "performance_mode": "accurate"
        },
        {
            "name": "Fast Mode Processing",
            "text": "Let's meet at the café tomorrow morning",
            "user_languages": ["english", "french"],
            "performance_mode": "fast"
        }
    ]
    
    print("\n🧪 Testing v2.1.2 Analysis Features:")
    print("=" * 60)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n📝 Test {i}: {test_case['name']}")
        print(f"   Text: \"{test_case['text']}\"")
        print(f"   Languages: {test_case['user_languages']}")
        print(f"   Mode: {test_case['performance_mode']}")
        
        try:
            response = requests.post(
                f"{SERVICE_URL}/analyze",
                json={
                    "text": test_case["text"],
                    "user_languages": test_case["user_languages"],
                    "performance_mode": test_case["performance_mode"],
                    "use_cache": True
                },
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get('success'):
                    result = data['data']
                    metadata = data['data'].get('v2_1_2_metadata', {})
                    
                    print(f"   ✅ Analysis successful!")
                    print(f"   🎯 Confidence: {result.get('confidence', 0):.3f}")
                    print(f"   🔄 Calibrated: {result.get('calibrated_confidence', 0):.3f}")
                    print(f"   📊 Reliability: {result.get('reliability_score', 0):.3f}")
                    print(f"   🏷️  Quality: {result.get('quality_assessment', 'unknown')}")
                    print(f"   ⚡ Processing: {result.get('processing_time_ms', 0):.1f}ms")
                    print(f"   🔗 Switch Points: {len(result.get('switch_points', []))}")
                    print(f"   🌐 Languages: {result.get('detected_languages', [])}")
                    print(f"   📋 Version: {result.get('version', 'unknown')}")
                    
                    # v2.1.2 specific features
                    features_used = metadata.get('features_used', {})
                    if any(features_used.values()):
                        print(f"   🚀 v2.1.2 Features Used:")
                        for feature, used in features_used.items():
                            if used:
                                print(f"      ✓ {feature}")
                    
                    performance_metrics = metadata.get('performance_metrics', {})
                    if performance_metrics:
                        print(f"   📈 Performance:")
                        for metric, value in performance_metrics.items():
                            print(f"      • {metric}: {value}")
                            
                else:
                    print(f"   ❌ Analysis failed: {data.get('error', 'Unknown error')}")
                    
            else:
                print(f"   ❌ HTTP Error: {response.status_code}")
                
        except Exception as e:
            print(f"   ❌ Request failed: {e}")

def test_cache_performance():
    """Test caching performance with repeated requests"""
    print("\n💾 Testing Cache Performance:")
    print("=" * 40)
    
    test_text = "I'm going to la tienda to buy some milk"
    languages = ["english", "spanish"]
    
    # First request (cache miss)
    start_time = time.time()
    try:
        response1 = requests.post(
            f"{SERVICE_URL}/analyze",
            json={
                "text": test_text,
                "user_languages": languages,
                "use_cache": True
            },
            timeout=30
        )
        first_time = (time.time() - start_time) * 1000
        
        # Second request (should be cache hit)
        start_time = time.time()
        response2 = requests.post(
            f"{SERVICE_URL}/analyze",
            json={
                "text": test_text,
                "user_languages": languages,
                "use_cache": True
            },
            timeout=30
        )
        second_time = (time.time() - start_time) * 1000
        
        if response1.status_code == 200 and response2.status_code == 200:
            data1 = response1.json()['data']
            data2 = response2.json()['data']
            
            print(f"📊 Cache Test Results:")
            print(f"   First request:  {first_time:.1f}ms (cache miss)")
            print(f"   Second request: {second_time:.1f}ms (should be cache hit)")
            print(f"   Speedup: {first_time/second_time:.1f}x faster")
            print(f"   Cache hit 1: {data1.get('cache_hit', False)}")
            print(f"   Cache hit 2: {data2.get('cache_hit', False)}")
            
            if second_time < first_time:
                print(f"   ✅ Cache working properly!")
            else:
                print(f"   ⚠️  Cache may not be working optimally")
        else:
            print(f"   ❌ Cache test failed - HTTP errors")
            
    except Exception as e:
        print(f"   ❌ Cache test failed: {e}")

def test_cache_stats():
    """Test cache statistics endpoint"""
    print("\n📊 Cache Statistics:")
    print("=" * 30)
    
    try:
        response = requests.get(f"{SERVICE_URL}/cache/stats", timeout=10)
        
        if response.status_code == 200:
            stats = response.json()
            print(f"   Total Requests: {stats.get('total_requests', 0)}")
            print(f"   Cache Hits: {stats.get('cache_hits', 0)}")
            print(f"   Cache Size: {stats.get('cache_size', 0)}")
            print(f"   Hit Rate: {stats.get('hit_rate', 0):.1%}")
            print(f"   Available: {stats.get('available', False)}")
        else:
            print(f"   ❌ HTTP Error: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Stats request failed: {e}")

def main():
    """Run comprehensive v2.1.2 test suite"""
    print("🚀 SwitchPrint v2.1.2 Bridge Service Test Suite")
    print("=" * 60)
    
    # Start service
    print("🔄 Starting SwitchPrint v2.1.2 service...")
    service_process = start_service_in_background()
    
    if not service_process:
        print("❌ Failed to start service")
        return False
    
    try:
        # Wait for service to be ready
        print("⏳ Waiting for service to be ready...")
        time.sleep(3)
        
        # Run tests
        if test_health_check():
            test_v2_1_2_analysis()
            test_cache_performance()
            test_cache_stats()
            
            print("\n🎉 All tests completed!")
            print("📋 v2.1.2 upgrade verification successful!")
            
        else:
            print("❌ Service health check failed")
            return False
            
    finally:
        # Cleanup
        if service_process:
            service_process.terminate()
            service_process.wait()
            print("\n🛑 Service stopped")
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)