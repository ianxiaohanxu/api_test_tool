***Settings***
| Library | test_api.py |
| Variables | variable.py |
| Suite Setup | Suite_setup | ${host} | ${api_dict} |

***Variables***
| ${host} | http://localhost:8000 |

***Keywords***
Suite_setup
|  | [Arguments] | ${host} | ${api_dict} |
|  | ${resp_stack}= | Prepare parent api | ${host} | ${api_dict} |
|  | Set Suite Variable | ${resp_stack} |

***Test Cases***
Test api demo
|  | [tags] | smoke | regression |
|  | Test Api | ${host} | ${api_dict} | demo | ${resp_stack} |

Test api patient
|  | [tags] | smoke |
|  | Test Api | ${host} | ${api_dict} | patient | ${resp_stack} |

