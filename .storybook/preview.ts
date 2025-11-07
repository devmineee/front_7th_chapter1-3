import type { Preview } from '@storybook/react-vite';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },

    // Chromatic 설정
    chromatic: {
      // 스냅샷을 찍기 전 지연 시간 (애니메이션 완료 대기)
      delay: 300,
      // 여러 뷰포트에서 테스트 (반응형 확인)
      viewports: [320, 768, 1200],
      // 애니메이션 비활성화
      disableSnapshot: false,
      // diff 임계값 (0-1, 높을수록 더 큰 차이를 허용)
      diffThreshold: 0.2,
    },

    // 배경 설정
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#ffffff',
        },
        {
          name: 'dark',
          value: '#333333',
        },
      ],
    },
  },
};

export default preview;
