import { useState, useMemo } from 'react';
import {
  Container,
  Typography,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  type SelectChangeEvent
} from '@mui/material';
import { useSurveyData } from '../../hooks/useSurveyData';
import type { SurveyAnswer } from '../../types/survey';

export default function DataReviewPage() {
  const { surveyData, isLoading, isError } = useSurveyData();
  const [selectedTopline, setSelectedTopline] = useState<string>('');
  const [selectedCrosstabVertical, setSelectedCrosstabVertical] = useState<string>('');
  const [selectedCrosstabHorizontal, setSelectedCrosstabHorizontal] = useState<string>('');

  const handleToplineChange = (event: SelectChangeEvent) => {
    setSelectedTopline(event.target.value);
  };

  const handleCrosstabVerticalChange = (event: SelectChangeEvent) => {
    setSelectedCrosstabVertical(event.target.value);
  };

  const handleCrosstabHorizontalChange = (event: SelectChangeEvent) => {
    setSelectedCrosstabHorizontal(event.target.value);
  };

  const toplineQuestion = useMemo(() => {
    return surveyData?.survey_topline.find(q => q.question_varname === selectedTopline) || null;
  }, [surveyData, selectedTopline]);

  const crosstabData = useMemo(() => {
    if (!selectedCrosstabVertical || !selectedCrosstabHorizontal) return null;
    return surveyData?.survey_crosstab.find(c => c.vertical_varname === selectedCrosstabVertical && c.horizontal_varname === selectedCrosstabHorizontal) || null;
  }, [surveyData, selectedCrosstabVertical, selectedCrosstabHorizontal]);

  if (isLoading) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <CircularProgress />
        </Box>
    );
  }

  if (isError || !surveyData) {
    return <Typography sx={{ p: 2 }}>Error loading survey data. Please ensure you have a project selected and survey data has been processed.</Typography>;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Typography variant="h4" gutterBottom>Data Review</Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Topline</Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel id="topline-select-label">Select a Question</InputLabel>
              <Select
                labelId="topline-select-label"
                value={selectedTopline}
                onChange={handleToplineChange}
              >
                {surveyData.survey_topline.map((q) => (
                  <MenuItem key={q.question_varname} value={q.question_varname}>
                    {q.question_text}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {toplineQuestion && (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{toplineQuestion.question_text}</TableCell>
                      <TableCell align="right">Percentage</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {toplineQuestion.survey_answers.map((answer: SurveyAnswer) => (
                      <TableRow key={answer.answer_number}>
                        <TableCell>{answer.answer_text}</TableCell>
                        <TableCell align="right">{answer.percentage.toFixed(2)}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          <Paper sx={{ p: 2 }}>
            <Typography variant="h6">Crosstab</Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                <FormControl fullWidth>
                  <InputLabel id="crosstab-vertical-label">Vertical Question</InputLabel>
                  <Select
                    labelId="crosstab-vertical-label"
                    value={selectedCrosstabVertical}
                    onChange={handleCrosstabVerticalChange}
                  >
                    {surveyData.survey_crosstab.map(c => c.vertical_varname).filter((v, i, a) => a.indexOf(v) === i).map((varname) => (
                        <MenuItem key={varname} value={varname}>
                            {surveyData.survey_crosstab.find(c => c.vertical_varname === varname)?.vertical_question}
                        </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="crosstab-horizontal-label">Horizontal Question</InputLabel>
                  <Select
                    labelId="crosstab-horizontal-label"
                    value={selectedCrosstabHorizontal}
                    onChange={handleCrosstabHorizontalChange}
                  >
                     {surveyData.survey_crosstab.map(c => c.horizontal_varname).filter((v, i, a) => a.indexOf(v) === i).map((varname) => (
                        <MenuItem key={varname} value={varname}>
                            {surveyData.survey_crosstab.find(c => c.horizontal_varname === varname)?.horizontal_question}
                        </MenuItem>
                    ))}
                  </Select>
                </FormControl>
            </Box>

            {crosstabData && (
              <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{crosstabData.vertical_question}</TableCell>
                      {crosstabData.crosstab_answers.map(a => a.horizontal_answer).filter((v,i,a) => a.indexOf(v) === i).map(h_answer => (
                          <TableCell key={h_answer} align="right">{h_answer}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {crosstabData.crosstab_answers.map(a => a.vertical_answer).filter((v,i,a) => a.indexOf(v) === i).map(v_answer => (
                        <TableRow key={v_answer}>
                            <TableCell>{v_answer}</TableCell>
                            {crosstabData.crosstab_answers.map(a => a.horizontal_answer).filter((v,i,a) => a.indexOf(v) === i).map(h_answer => {
                                const answer = crosstabData.crosstab_answers.find(a => a.vertical_answer === v_answer && a.horizontal_answer === h_answer);
                                return (
                                    <TableCell key={h_answer} align="right">
                                        {answer ? `${answer.percentage.toFixed(2)}%` : '-'}
                                    </TableCell>
                                );
                            })}
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
      </Box>
    </Container>
  );
}