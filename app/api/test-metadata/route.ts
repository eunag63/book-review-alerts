import { NextResponse } from 'next/server';
import { getReviewCountsByPeriod } from '../../../lib/reviewUtils';

export async function GET() {
  try {
    console.log('Testing review counts...');
    const counts = await getReviewCountsByPeriod();
    console.log('Review counts:', counts);
    
    return NextResponse.json({
      success: true,
      counts,
      message: `Today: ${counts.today}, ThisWeek: ${counts.thisWeek}, NextWeek: ${counts.nextWeek}`
    });
  } catch (error) {
    console.error('Error testing metadata:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}