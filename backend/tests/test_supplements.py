import pytest
import asyncio

from app.ai_service import AIService

@pytest.mark.asyncio
async def test_get_supplement_recommendations_monkeypatched(monkeypatch):
    svc = AIService()

    # Mock PubMed search to return deterministic citations
    async def fake_search_pubmed(query, max_results=2):
        return [
            {"title": f"Study on {query}", "source": "Journal of Trials", "year": 2020, "pmid": "12345"},
            {"title": f"Another trial for {query}", "source": "Clinical Nutrition", "year": 2019, "pmid": "67890"}
        ]

    async def fake_summarize(name, citations):
        return {"summary": f"{name} shows moderate evidence.", "evidence_level": "moderate"}

    monkeypatch.setattr(svc, "_search_pubmed_research", fake_search_pubmed)
    monkeypatch.setattr(svc, "_summarize_citations_with_claude", fake_summarize)

    # Call with a sample goal
    result = await svc.get_supplement_recommendations(user_id="user_1", goals=["strength"], preferences=None)

    assert isinstance(result, dict)
    assert "supplements" in result
    assert isinstance(result["supplements"], list)
    assert len(result["supplements"]) > 0

    for s in result["supplements"]:
        assert "name" in s
        assert "typical_dose" in s
        assert "citations" in s
        assert isinstance(s["citations"], list)
        # Should contain the fake summary
        assert s.get("evidence_summary") is not None
        assert s.get("evidence_level") == "moderate"

    assert "meta" in result
    assert "generated_at" in result["meta"]
