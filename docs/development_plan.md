# 3D 가위바위보 - 개발 계획 (OOP & RxJS)

## 1. 프로젝트 개요
**목표**: Babylon.js와 RxJS를 활용한 리액티브 3D 가위바위보 게임 제작.
**타겟 플랫폼**: 모바일 및 웹 브라우저.
**컨셉**: 3D 게임기 인터페이스. 틸트/파괴/해킹 등 자유도가 높은 상호작용 제공.

## 2. 기술 스택
- **엔진**: Babylon.js
- **언어**: TypeScript (Strict OOP)
- **상태 관리**: RxJS (BehaviorSubject, Observable)
- **번들러**: Vite
- **패키지 매니저**: npm/bun

## 3. 아키텍처 (Reactive Service Pattern)

### 3.1 Core Services (Singleton/DI)
- **`GameStore`**: 게임 전역 상태 (점수, 승패) 및 기계 상태 (파손, 해킹 모드) 관리.
- **`SceneService`**: Babylon.js 엔진 관리. `ArcRotateCamera`를 사용하여 게임기 중심의 자유로운 시점 조작(Rotate/Zoom) 구현.
- **`InputService`**: 마우스/터치 및 디바이스 모션(기울기/흔들기) 감지 스트림.
- **`AudioService`**: Babylon.js `Sound` 객체를 래핑하여 효과음/배경음 관리.

### 3.2 Domain Objects (OOP)
- **`Hand`**: 3D 손 모델.
- **`GameMachine`**: 게임기 본체. 
    - 부품(나사, 패널)별 파괴/해킹 로직 포함.
    - `tilt()`: 기울임 처리에 따른 물리/시각 효과.
    - `hack()`: 내부 회로 조작 시 게임 로직 변조.

### 3.3 Game Flow (RxJS Stream)
1.  **Input Stream**: 3D 모델 클릭 -> `choice$` Subject 발행.
2.  **State Stream**: `choice$` 구독 -> `GameStore` 상태 업데이트 (IDLE -> ANIMATING).
3.  **Render Loop**: `state$` 변화에 따라 씬 내 객체(뷰) 업데이트.

## 4. 에셋 요구사항
### 1단계 (프로토타입)
- **Primitives**: 큐브/구체로 가위/바위/보 표현.
- **Camera**: `ArcRotateCamera`로 360도 회전/줌 기능 구현.
- **Interactive Parts**: 클릭 가능한 '나사' 역할을 하는 작은 구체 배치.

### 2단계 (폴리싱)
- **Models**: 분해 가능한 게임기 모델 (나사, 케이스 분리).
- **Audio**: Babylon.js Sound 적용 (나사 풀기, 기계 충격, BGM).
- **Hacking UI**: 해킹 성공 시 글리치 효과.

## 5. 구현 로드맵
1.  **설정**: RxJS 설치 및 기본 구조 잡기.
2.  **Core 구현**: `GameStore`, `SceneService` 클래스 구현.
3.  **로직 연결**: `InputService` -> `GameStore` 흐름 연결.
4.  **3D 바인딩**: 상태 스트림을 구독하여 3D 객체 제어.

## 6. 디렉토리 구조 및 코드 기법 (구현 현황)

### 디렉토리 구조
```
src/
  ├── core/            # 핵심 엔진 코드 (Singleton)
  │   └── SceneService.ts   # Babylon.js 엔진/씬/카메라 라이프사이클 관리
  ├── store/           # 상태 관리 (RxJS Store)
  │   └── GameStore.ts      # 게임의 전역 상태(코인, 결과 등)를 관리하는 Single Source of Truth
  ├── services/        # 비즈니스 로직 및 유틸리티 (Singleton)
  │   ├── AudioService.ts   # 효과음/배경음 관리
  │   ├── InputService.ts   # 입력(터치, 모션 등)을 RxJS 스트림으로 변환
  │   └── RpsGameService.ts # 가위바위보 승패 판정 및 게임 진행 로직
  ├── models/          # 3D 객체 및 도메인 모델
  │   ├── GameMachine.ts    # 게임기 본체 (3D 메쉬 + 틸트/상호작용 로직)
  │   └── Hand.ts           # 가위바위보 손 모델
  ├── app.ts           # 메인 진입점 (View 역할, 서비스 연결)
  └── style.css
```

### 적용된 코드 기법 (Design Patterns)
1.  **Reactive Service Pattern (RxJS)**:
    -   `GameStore`를 통해 상태를 `BehaviorSubject`로 관리하고 `Observable`로 노출.
    -   UI와 로직이 이벤트를 구독(Subscribe)하여 상태 변화에 반응형으로 동작.

2.  **Singleton Pattern (싱글톤 패턴)**:
    -   `GameStore`, `SceneService`, `InputService` 등 주요 서비스 클래스를 싱글톤으로 구현하여 전역에서 유일한 인스턴스 보장 및 접근 용이성 확보.

3.  **Encapsulation (캡슐화 - OOP)**:
    -   `GameMachine`, `Hand`와 같은 도메인 객체가 자신의 3D 메쉬와 관련된 동작(틸트, 애니메이션 등)을 내부 메서드로 관리하고 외부에는 필요한 인터페이스만 노출.

4.  **Separation of Concerns (관심사 분리)**:
    -   **View**: `app.ts` (화면 표시, UI 생성)
    -   **State**: `GameStore.ts` (데이터 관리)
    -   **Logic**: `RpsGameService.ts` (게임 규칙)
    -   **Core**: `SceneService.ts` (엔진 제어)

